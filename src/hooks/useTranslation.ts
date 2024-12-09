import { t } from '../i18n';

export function useTranslation() {
  return {
    t: (key: string) => t(key)
  };
}