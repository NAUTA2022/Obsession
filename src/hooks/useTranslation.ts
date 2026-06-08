import { usePreferencesStore } from '../store/preferences';
import { en } from '../i18n/locales/en';
import { es } from '../i18n/locales/es';

type TranslationKey = string;

const translations = {
  en,
  es,
} as const;

type Language = keyof typeof translations;

export function useTranslation() {
  const language = usePreferencesStore((state) => state.language) as Language;

  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations[language] || translations.es;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to Spanish if key doesn't exist in current language
        value = translations.es;
        for (const fallbackKey of keys) {
          value = value?.[fallbackKey];
          if (value === undefined) {
            console.warn(`Translation key "${key}" not found`);
            return key; // Return the key itself if translation not found
          }
        }
        break;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return { t, language };
}
