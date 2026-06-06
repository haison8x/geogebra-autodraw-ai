// chrome.storage.local persistence — spec §9. History ≤ 20, FIFO on quota overflow.

import { DEFAULT_DELAY_MS } from './messages';
import { detectLocale, type Locale } from './i18n';

export type HistoryItem = { id: string; problem: string; commands: string[] };

export type PromptMode = 'flash' | 'advanced';

export type Settings = {
  delayMs: number;
  clearFirstDefault: boolean;
  locale: Locale;
  promptMode: PromptMode;
};

export type StorageSchema = {
  lastProblem: string;
  lastInterpretation: string;
  lastCommandsRaw: string;
  settings: Settings;
  history: HistoryItem[];
};

export const HISTORY_LIMIT = 20;

export const DEFAULTS: StorageSchema = {
  lastProblem: '',
  lastInterpretation: '',
  lastCommandsRaw: '',
  settings: { delayMs: DEFAULT_DELAY_MS, clearFirstDefault: true, locale: detectLocale(), promptMode: 'flash' },
  history: [],
};

export async function getState(): Promise<StorageSchema> {
  try {
    const got = (await chrome.storage.local.get(DEFAULTS)) as Partial<StorageSchema>;
    return {
      ...DEFAULTS,
      ...got,
      settings: { ...DEFAULTS.settings, ...(got.settings ?? {}) },
      history: Array.isArray(got.history) ? got.history : [],
    };
  } catch (e) {
    console.error('storage.get failed', e);
    return { ...DEFAULTS };
  }
}

export async function patchState(patch: Partial<StorageSchema>): Promise<void> {
  try {
    await chrome.storage.local.set(patch);
  } catch (e) {
    // Quota exceeded → trim history (FIFO) and retry once (spec §10).
    if (isQuotaError(e) && patch.history) {
      const trimmed = patch.history.slice(-Math.floor(HISTORY_LIMIT / 2));
      try {
        await chrome.storage.local.set({ ...patch, history: trimmed });
        return;
      } catch (e2) {
        console.error('storage.set still failing after trimming history', e2);
      }
    }
    console.error('storage.set failed', e);
  }
}

// Append one history item, keeping ≤ HISTORY_LIMIT (FIFO drops the oldest).
export function pushHistory(history: HistoryItem[], item: HistoryItem): HistoryItem[] {
  const next = [...history, item];
  return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
}

function isQuotaError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return /QUOTA_BYTES|quota/i.test(msg);
}
