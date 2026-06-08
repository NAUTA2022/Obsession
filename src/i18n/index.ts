import { es } from './locales/es';
import { en } from './locales/en';

export const translations = {
  es,
  en,
} as const;

export type Language = keyof typeof translations;
export type TranslationKeys = typeof es;

// Helper function to get nested translation keys
export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<TranslationKeys>;

// Helper function to get translation value by path
export function getTranslationByPath(
  translations: TranslationKeys,
  path: string
): string {
  return path.split('.').reduce((obj, key) => {
    return obj && typeof obj === 'object' ? (obj as any)[key] : obj;
  }, translations as any) || path;
}

