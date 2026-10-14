'use client';

/**
 * useTranslation Hook
 * Provides easy access to reactive translations throughout the app
 */

import { useLanguageStore } from '@/store/languageStore';
import { translations, type Translations, type Language } from './translations';

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t: Translations = translations[language] || translations.es;

  return { t, language, setLanguage };
}

// Helper function to get nested translation values
export function getNestedTranslation(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

