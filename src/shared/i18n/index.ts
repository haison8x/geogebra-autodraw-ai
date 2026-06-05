// i18n entry point — spec §16, Epic 6. t() with fallback + interpolation, detectLocale().
import type { Locale, Messages, MessageKey } from './types';
import { en } from './locales/en';
import { vi } from './locales/vi';
import { zhCN } from './locales/zh-CN';
import { es } from './locales/es';
import { pt } from './locales/pt';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { ja } from './locales/ja';
import { ko } from './locales/ko';

export type { Locale, Messages, MessageKey };
export { SUPPORTED_LOCALES, LOCALE_NATIVE_NAMES } from './types';

export const locales: Record<Locale, Messages> = {
  en,
  vi,
  'zh-CN': zhCN,
  es,
  pt,
  fr,
  de,
  ja,
  ko,
};

// Look up a string for the locale; fall back to `en`, then to the raw key.
// Interpolates {name} placeholders from `vars`.
export function t(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  const dict = locales[locale] ?? en;
  let s = dict[key] ?? en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

// Map a browser UI language to a supported locale; unknown → 'en'.
export function detectLocale(raw?: string): Locale {
  let ui = raw;
  if (ui == null && typeof chrome !== 'undefined') {
    ui = chrome.i18n?.getUILanguage?.();
  }
  ui = (ui ?? '').toLowerCase();
  if (!ui) return 'en';
  if (ui.startsWith('zh')) return 'zh-CN'; // zh, zh-cn, zh-tw, zh-hans... → Simplified
  const base = ui.split('-')[0];
  const map: Record<string, Locale> = {
    en: 'en',
    vi: 'vi',
    es: 'es',
    pt: 'pt',
    fr: 'fr',
    de: 'de',
    ja: 'ja',
    ko: 'ko',
  };
  return map[base] ?? 'en';
}
