// i18n types — spec §16, Epic 6. `en` is the canonical key set; every locale must match it.
import { en } from './locales/en';

export type Locale = 'en' | 'vi' | 'zh-CN' | 'es' | 'pt' | 'fr' | 'de' | 'ja' | 'ko';

export type Messages = typeof en;
export type MessageKey = keyof Messages;

export const SUPPORTED_LOCALES: Locale[] = ['en', 'vi', 'zh-CN', 'es', 'pt', 'fr', 'de', 'ja', 'ko'];

export const LOCALE_NATIVE_NAMES: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
  'zh-CN': '简体中文',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  ko: '한국어',
};
