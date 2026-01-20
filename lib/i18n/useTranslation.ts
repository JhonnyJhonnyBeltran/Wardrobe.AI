/**
 * useTranslation Hook
 * Provides easy access to translations throughout the app
 */

// import { useLanguage } from '@/store/languageStore'; // Removed store dependency
import { translations, type Translations } from './translations';
// import type { Language } from '@/store/languageStore';

export function useTranslation() {
  // Hardcoded to Spanish as per requirements
  const language = 'es';
  const t: Translations = translations[language];

  return { t, language };
}

// Helper function to get nested translation values
export function getNestedTranslation(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}
