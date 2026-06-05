import { describe, it, expect } from 'vitest';
import { t, detectLocale, locales, SUPPORTED_LOCALES, LOCALE_NATIVE_NAMES } from '../src/shared/i18n';

describe('t()', () => {
  it('returns the locale string', () => {
    expect(t('vi', 'generatePrompt')).toBe('Sinh Prompt');
    expect(t('en', 'generatePrompt')).toBe('Generate Prompt');
  });

  it('interpolates {vars}', () => {
    expect(t('en', 'running', { index: 2, total: 5 })).toBe('Running 2/5…');
    expect(t('en', 'commandsCount', { count: 7 })).toBe('7 commands');
  });

  it('falls back to en for an unknown locale', () => {
    // @ts-expect-error — intentionally invalid locale
    expect(t('xx', 'generatePrompt')).toBe('Generate Prompt');
  });
});

describe('detectLocale()', () => {
  it('maps regional variants to base locale', () => {
    expect(detectLocale('en-US')).toBe('en');
    expect(detectLocale('en-GB')).toBe('en');
    expect(detectLocale('pt-BR')).toBe('pt');
    expect(detectLocale('fr-CA')).toBe('fr');
  });

  it('maps all Chinese variants to zh-CN', () => {
    expect(detectLocale('zh')).toBe('zh-CN');
    expect(detectLocale('zh-CN')).toBe('zh-CN');
    expect(detectLocale('zh-TW')).toBe('zh-CN');
    expect(detectLocale('zh-Hans')).toBe('zh-CN');
  });

  it('unknown / empty → en', () => {
    expect(detectLocale('xx')).toBe('en');
    expect(detectLocale('')).toBe('en');
    expect(detectLocale()).toBe('en'); // no chrome in test env
  });

  it('supports vi, ja, ko, de, es', () => {
    expect(detectLocale('vi')).toBe('vi');
    expect(detectLocale('ja-JP')).toBe('ja');
    expect(detectLocale('ko-KR')).toBe('ko');
    expect(detectLocale('de-DE')).toBe('de');
    expect(detectLocale('es-MX')).toBe('es');
  });
});

describe('locale parity', () => {
  const enKeys = Object.keys(locales.en).sort();

  for (const loc of SUPPORTED_LOCALES) {
    it(`${loc} has the exact same key set as en`, () => {
      expect(Object.keys(locales[loc]).sort()).toEqual(enKeys);
    });
  }

  it('every supported locale has a native name + a dictionary', () => {
    for (const loc of SUPPORTED_LOCALES) {
      expect(LOCALE_NATIVE_NAMES[loc]).toBeTruthy();
      expect(locales[loc]).toBeTruthy();
    }
  });

  it('placeholders are preserved across locales', () => {
    for (const loc of SUPPORTED_LOCALES) {
      expect(locales[loc].running).toMatch(/\{index\}/);
      expect(locales[loc].running).toMatch(/\{total\}/);
      expect(locales[loc].doneErrors).toMatch(/\{errors\}/);
    }
  });
});
