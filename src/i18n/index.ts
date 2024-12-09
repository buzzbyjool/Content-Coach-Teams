import { fr } from './fr';

export const defaultLocale = 'fr';

export const translations = {
  fr
};

export type TranslationKey = keyof typeof fr;

export function t(key: string): string {
  const keys = key.split('.');
  let value: any = translations[defaultLocale];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key;
    }
  }
  
  return typeof value === 'string' ? value : key;
}