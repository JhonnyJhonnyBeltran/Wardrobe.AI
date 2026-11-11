'use client';

/**
 * Language Store - Global state management for App Internationalization
 * Supports automatic detection from Google Account (OAuth locale), Browser (Accept-Language / navigator.language),
 * and manual override from Settings with localStorage and cookie persistence.
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import type { Language } from '@/lib/i18n/translations';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
];

const VALID_CODES = new Set<string>(['es', 'en', 'fr', 'de', 'it', 'pt']);

export function normalizeLanguage(locale?: string | null): Language {
  if (!locale) return 'es';
  const clean = locale.toLowerCase().trim().split(/[-_]/)[0];
  if (VALID_CODES.has(clean)) {
    return clean as Language;
  }
  return 'es';
}

function setLanguageCookie(lang: Language) {
  if (typeof document !== 'undefined') {
    document.cookie = `klozet_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  }
}

export function isSpainOrSpanishUser(): boolean {
  if (typeof window === 'undefined') return true;

  try {
    // 1. Domain ends with .es (e.g. klozet.es, dev.klozet.es)
    if (window.location && window.location.hostname) {
      const host = window.location.hostname.toLowerCase();
      if (host.endsWith('.es') || host.includes('.es:')) return true;
    }
  } catch (e) {}

  try {
    // 2. Timezone in Spain (Europe/Madrid, Atlantic/Canary, Africa/Ceuta)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && (tz.includes('Madrid') || tz.includes('Canary') || tz.includes('Ceuta') || tz.includes('Spain'))) {
      return true;
    }
  } catch (e) {}

  try {
    // 3. User navigator languages includes Spanish
    if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
      if (navigator.languages.some(lang => lang && lang.toLowerCase().startsWith('es'))) {
        return true;
      }
    }
    const navLang = navigator.language || (navigator as any).userLanguage;
    if (navLang && navLang.toLowerCase().startsWith('es')) {
      return true;
    }
  } catch (e) {}

  return false;
}

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'es';

  try {
    // 1. Explicit user manual override has highest priority
    const isManual = localStorage.getItem('klozet_language_manual') === 'true';
    const saved = localStorage.getItem('klozet_language');
    if (isManual && saved && VALID_CODES.has(saved)) {
      return saved as Language;
    }
  } catch (e) {}

  // 2. Spain detection priority: domain .es, Spanish timezones, or Spanish navigator locales
  if (isSpainOrSpanishUser()) {
    return 'es';
  }

  try {
    // 3. Cookie check (if explicit manual)
    const match = document.cookie.match(/(?:^|;\s*)klozet_language=([^;]+)/);
    if (match && VALID_CODES.has(match[1])) {
      const isManual = localStorage.getItem('klozet_language_manual') === 'true';
      if (isManual) return match[1] as Language;
    }
  } catch (e) {}

  try {
    // 4. Browser / system language for non-Spain users
    const browserLang = navigator.language || (navigator as any).userLanguage;
    if (browserLang) {
      return normalizeLanguage(browserLang);
    }
  } catch (e) {}

  return 'es';
}

interface LanguageState {
  language: Language;
  isManual: boolean;
  setLanguage: (lang: Language, syncDbUserId?: string) => Promise<void>;
  detectAndSetFromGoogle: (googleLocale?: string | null, userId?: string) => Promise<void>;
  initLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'es',
  isManual: false,

  initLanguage: () => {
    if (typeof window === 'undefined') return;
    const initial = getInitialLanguage();
    const isManual = localStorage.getItem('klozet_language_manual') === 'true';
    
    setLanguageCookie(initial);
    document.documentElement.lang = initial;
    
    set({ language: initial, isManual });
  },

  setLanguage: async (lang: Language, syncDbUserId?: string) => {
    if (!VALID_CODES.has(lang)) return;

    // Update local state
    set({ language: lang, isManual: true });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('klozet_language', lang);
        localStorage.setItem('klozet_language_manual', 'true');
      } catch (e) {}
      setLanguageCookie(lang);
      document.documentElement.lang = lang;
    }

    // Persist to user profile in Supabase if logged in
    try {
      const targetUserId = syncDbUserId || (await supabase.auth.getUser()).data.user?.id;
      if (targetUserId) {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('notification_preferences')
          .eq('id', targetUserId)
          .maybeSingle();

        const currentPrefs = (currentProfile as any)?.notification_preferences || {};

        const { error: updateErr } = await supabase
          .from('profiles')
          .update({
            language: lang,
            notification_preferences: {
              ...currentPrefs,
              language: lang,
            },
          } as any)
          .eq('id', targetUserId);

        if (updateErr) {
          // Fallback if top-level language column does not exist
          await supabase
            .from('profiles')
            .update({
              notification_preferences: {
                ...currentPrefs,
                language: lang,
              },
            } as any)
            .eq('id', targetUserId);
        }
      }
    } catch (err) {
      // Non-blocking if column doesn't exist yet
      console.warn('[LanguageStore] Profile language sync:', err);
    }
  },

  detectAndSetFromGoogle: async (googleLocale?: string | null, userId?: string) => {
    if (!googleLocale) return;

    // If user already manually selected their language in Settings, do not override
    if (typeof window !== 'undefined') {
      const isManual = localStorage.getItem('klozet_language_manual') === 'true';
      if (isManual) return;
    }

    const detectedLang = normalizeLanguage(googleLocale);
    set({ language: detectedLang, isManual: false });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('klozet_language', detectedLang);
      } catch (e) {}
      setLanguageCookie(detectedLang);
      document.documentElement.lang = detectedLang;
    }

    if (userId) {
      try {
        await supabase
          .from('profiles')
          .update({ language: detectedLang })
          .eq('id', userId);
      } catch (e) {}
    }
  },
}));
