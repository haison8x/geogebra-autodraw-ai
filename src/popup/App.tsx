// Popup UI — spec §3.1, §6, §10.1, §12, §16. Enter problem → generate prompt → copy → paste
// commands → sanitize → editable preview → pick draw mode → Execute → track progress.
// Fully localized (Epic 6) via t(locale, key).
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ErrorItem, Message } from '@/shared/messages';
import { DEFAULT_DELAY_MS } from '@/shared/messages';
import { sanitizeCommands } from '@/shared/sanitize';
import { buildPrompt } from '@/shared/promptTemplate';
import { loadMinCommands, formatCatalog } from '@/shared/catalog';
import {
  getState,
  patchState,
  pushHistory,
  type HistoryItem,
  type Settings,
} from '@/shared/storage';
import { t, SUPPORTED_LOCALES, LOCALE_NATIVE_NAMES, type Locale } from '@/shared/i18n';

type Phase = 'idle' | 'running' | 'done';

const CALC_URL = 'https://www.geogebra.org/calculator';
const isCalc = (url?: string) => url?.startsWith(CALC_URL) ?? false;

// Open the Calculator: focus an existing tab, else create one.
async function openCalculator(): Promise<void> {
  try {
    const existing = await chrome.tabs.query({ url: `${CALC_URL}*` });
    const tab = existing[0];
    if (tab?.id != null) {
      await chrome.tabs.update(tab.id, { active: true });
      if (tab.windowId != null) await chrome.windows.update(tab.windowId, { focused: true });
    } else {
      await chrome.tabs.create({ url: CALC_URL });
    }
  } catch (e) {
    console.error('openCalculator failed', e);
  }
}

export default function App() {
  const [problem, setProblem] = useState('');
  const [commandsRaw, setCommandsRaw] = useState('');
  const [clearFirst, setClearFirst] = useState(true);
  const [locale, setLocale] = useState<Locale>('en');
  const [prompt, setPrompt] = useState('');
  const [catalog, setCatalog] = useState('');
  const [catalogErr, setCatalogErr] = useState('');
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState({ index: 0, total: 0 });
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [onCalc, setOnCalc] = useState(true); // is the active tab a Calculator tab?

  const restored = useRef(false);

  const tr = useCallback(
    (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars),
    [locale],
  );

  // Load the command catalog + restore state (spec §12: last problem/commands, §16: locale).
  useEffect(() => {
    loadMinCommands()
      .then((cmds) => setCatalog(formatCatalog(cmds)))
      .catch((e) => setCatalogErr(String(e?.message ?? e)));

    getState().then((s) => {
      setProblem(s.lastProblem);
      setCommandsRaw(s.lastCommandsRaw);
      setClearFirst(s.settings.clearFirstDefault);
      setLocale(s.settings.locale);
      setHistory(s.history);
      restored.current = true;
    });
  }, []);

  // Listen for progress from the Background (spec §5).
  useEffect(() => {
    const listener = (msg: Message) => {
      switch (msg.action) {
        case 'PROGRESS':
          setPhase('running');
          setProgress({ index: msg.payload.index + 1, total: msg.payload.total });
          break;
        case 'COMMAND_ERROR':
          setErrors((prev) => [...prev, msg.payload]);
          break;
        case 'DONE':
          setPhase('done');
          setProgress({ index: msg.payload.executed, total: msg.payload.executed });
          setErrors(msg.payload.errors);
          break;
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  // Track whether the active tab is a GeoGebra Calculator tab (drives the gating banner).
  useEffect(() => {
    const refresh = () => {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }).then((tabs) => {
        setOnCalc(isCalc(tabs[0]?.url));
      }, () => {});
    };
    refresh();
    const onActivated = () => refresh();
    const onUpdated = (_id: number, info: { status?: string; url?: string }) => {
      if (info.status === 'complete' || info.url !== undefined) refresh();
    };
    chrome.tabs.onActivated.addListener(onActivated);
    chrome.tabs.onUpdated.addListener(onUpdated);
    chrome.windows?.onFocusChanged.addListener(onActivated);
    return () => {
      chrome.tabs.onActivated.removeListener(onActivated);
      chrome.tabs.onUpdated.removeListener(onUpdated);
      chrome.windows?.onFocusChanged.removeListener(onActivated);
    };
  }, []);

  // Persist last problem (lightly debounced).
  useEffect(() => {
    if (!restored.current) return;
    const t2 = setTimeout(() => void patchState({ lastProblem: problem }), 400);
    return () => clearTimeout(t2);
  }, [problem]);

  useEffect(() => {
    if (!restored.current) return;
    const t2 = setTimeout(() => void patchState({ lastCommandsRaw: commandsRaw }), 400);
    return () => clearTimeout(t2);
  }, [commandsRaw]);

  const persistSettings = useCallback(
    (next: Partial<Settings>) => {
      const settings: Settings = {
        delayMs: DEFAULT_DELAY_MS,
        clearFirstDefault: clearFirst,
        locale,
        ...next,
      };
      void patchState({ settings });
    },
    [clearFirst, locale],
  );

  const handleGeneratePrompt = useCallback(() => {
    if (!problem.trim() || !catalog) return;
    setPrompt(buildPrompt(problem, catalog));
    setCopied(false);
  }, [problem, catalog]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('clipboard failed', e);
    }
  }, [prompt]);

  // Paste AI commands → auto sanitize (spec §10.1).
  const handlePasteCommands = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    if (!text) return;
    e.preventDefault();
    setCommandsRaw(sanitizeCommands(text).join('\n'));
  }, []);

  const handleClearCommands = useCallback(() => setCommandsRaw(''), []);

  const setMode = useCallback(
    (mode: boolean) => {
      setClearFirst(mode);
      persistSettings({ clearFirstDefault: mode });
    },
    [persistSettings],
  );

  const changeLocale = useCallback(
    (next: Locale) => {
      setLocale(next);
      persistSettings({ locale: next });
    },
    [persistSettings],
  );

  const handleExecute = useCallback(async () => {
    const commands = sanitizeCommands(commandsRaw);
    if (commands.length === 0) return;

    setPhase('running');
    setProgress({ index: 0, total: commands.length });
    setErrors([]);

    // Record history (FIFO ≤ 20).
    const item: HistoryItem = { id: String(Date.now()), problem, commands };
    const nextHistory = pushHistory(history, item);
    setHistory(nextHistory);
    void patchState({ history: nextHistory });

    const msg: Message = { action: 'EXECUTE_COMMANDS', payload: { commands, clearFirst } };
    try {
      await chrome.runtime.sendMessage(msg);
    } catch (e) {
      console.error('sendMessage EXECUTE_COMMANDS failed', e);
    }
  }, [commandsRaw, problem, history, clearFirst]);

  const handleClearCanvas = useCallback(async () => {
    const msg: Message = { action: 'CLEAR_CANVAS', payload: {} };
    try {
      await chrome.runtime.sendMessage(msg);
    } catch (e) {
      console.error('sendMessage CLEAR_CANVAS failed', e);
    }
  }, []);

  const loadHistory = useCallback((item: HistoryItem) => {
    setProblem(item.problem);
    setCommandsRaw(item.commands.join('\n'));
  }, []);

  const commandCount = sanitizeCommands(commandsRaw).length;
  const canExecute = commandCount > 0 && phase !== 'running' && onCalc;

  return (
    <div className="relative space-y-3 p-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-base font-bold">GeoGebra AutoDraw AI</h1>
        <div className="flex items-center gap-1">
          <label className="flex items-center gap-1 text-xs">
            <span className="sr-only">{tr('languageLabel')}</span>
            <select
              className="rounded border px-1 py-0.5"
              aria-label={tr('languageLabel')}
              value={locale}
              onChange={(e) => changeLocale(e.target.value as Locale)}
            >
              {SUPPORTED_LOCALES.map((loc) => (
                <option key={loc} value={loc}>
                  {LOCALE_NATIVE_NAMES[loc]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="rounded border px-2 py-0.5 text-xs"
            aria-label={tr('helpButton')}
            title={tr('helpButton')}
            onClick={() => setShowHelp(true)}
          >
            ❓
          </button>
        </div>
      </div>

      {showHelp && <HelpPanel tr={tr} onClose={() => setShowHelp(false)} />}

      {/* Gating banner — extension only works on a Calculator tab */}
      {!onCalc && (
        <div className="rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800">
          <p>{tr('needCalcTab')}</p>
          <button
            type="button"
            className="mt-1 rounded bg-amber-600 px-2 py-1 font-medium text-white"
            onClick={openCalculator}
          >
            {tr('helpOpenCalculator')}
          </button>
        </div>
      )}

      {/* 1. Problem */}
      <label className="block">
        <span className="font-medium">{tr('problemLabel')}</span>
        <textarea
          className="mt-1 w-full rounded border p-2"
          rows={4}
          placeholder={tr('problemPlaceholder')}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
        />
      </label>

      <button
        className="w-full rounded bg-slate-700 px-3 py-2 font-medium text-white disabled:opacity-50"
        disabled={!problem.trim() || !catalog}
        onClick={handleGeneratePrompt}
      >
        {tr('generatePrompt')}
      </button>
      {catalogErr && <p className="text-xs text-red-600">{tr('catalogError', { error: catalogErr })}</p>}

      {/* 2. Generated prompt + copy */}
      {prompt && (
        <div className="space-y-1">
          <textarea className="w-full rounded border bg-slate-50 p-2 font-mono text-xs" rows={6} readOnly value={prompt} />
          <button className="w-full rounded bg-emerald-600 px-3 py-2 font-medium text-white" onClick={handleCopy}>
            {copied ? tr('copied') : tr('copyPrompt')}
          </button>
        </div>
      )}

      {/* 3. AI commands (paste → sanitize → editable) */}
      <label className="block">
        <span className="font-medium">{tr('commandsLabel')}</span>
        <textarea
          className="mt-1 w-full rounded border p-2 font-mono text-xs"
          rows={6}
          placeholder={tr('commandsPlaceholder')}
          value={commandsRaw}
          onChange={(e) => setCommandsRaw(e.target.value)}
          onPaste={handlePasteCommands}
        />
      </label>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{tr('commandsCount', { count: commandCount })}</span>
        <button
          type="button"
          className="text-red-600 underline disabled:opacity-40"
          onClick={handleClearCommands}
          disabled={commandsRaw.length === 0}
        >
          {tr('clearCommands')}
        </button>
      </div>

      {/* 4. Draw mode */}
      <fieldset className="space-y-1">
        <legend className="font-medium">{tr('drawMode')}</legend>
        <label className="flex items-center gap-2">
          <input type="radio" name="mode" checked={clearFirst} onChange={() => setMode(true)} />
          <span>{tr('modeClear')}</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="mode" checked={!clearFirst} onChange={() => setMode(false)} />
          <span>{tr('modeAppend')}</span>
        </label>
      </fieldset>

      {/* 5. Actions */}
      <div className="flex gap-2">
        <button
          className="flex-1 rounded bg-blue-600 px-3 py-2 font-medium text-white disabled:opacity-50"
          disabled={!canExecute}
          onClick={handleExecute}
        >
          {phase === 'running' ? tr('drawing') : tr('execute')}
        </button>
        <button
          className="rounded border border-slate-300 px-3 py-2 disabled:opacity-50"
          onClick={handleClearCanvas}
          disabled={!onCalc}
        >
          {tr('clearCanvas')}
        </button>
      </div>

      {/* 6. Status */}
      <StatusPanel phase={phase} progress={progress} errors={errors} tr={tr} />

      {/* 7. History */}
      {history.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer font-medium">{tr('historyTitle', { count: history.length })}</summary>
          <ul className="mt-1 space-y-1">
            {[...history].reverse().slice(0, 10).map((h) => (
              <li key={h.id}>
                <button className="truncate text-left text-blue-700 underline" onClick={() => loadHistory(h)}>
                  {h.problem.slice(0, 50) || tr('untitled')} — {tr('commandsCount', { count: h.commands.length })}
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function StatusPanel({
  phase,
  progress,
  errors,
  tr,
}: {
  phase: Phase;
  progress: { index: number; total: number };
  errors: ErrorItem[];
  tr: (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => string;
}) {
  if (phase === 'idle') return null;
  return (
    <div className="rounded border p-2 text-xs">
      {phase === 'running' && <p>{tr('running', { index: progress.index, total: progress.total })}</p>}
      {phase === 'done' && (
        <p className={errors.length ? 'text-amber-700' : 'text-emerald-700'}>
          {errors.length
            ? tr('doneErrors', { total: progress.total, errors: errors.length })
            : tr('done', { total: progress.total })}
        </p>
      )}
      {errors.length > 0 && (
        <ul className="mt-1 space-y-0.5 text-red-600">
          {errors.map((e) => (
            <li key={e.index}>
              {tr('errorLine', { line: e.index + 1 })} <code>{e.command}</code> — {e.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type Tr = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => string;

const HELP_STEP_KEYS = [
  'helpStep1',
  'helpStep2',
  'helpStep3',
  'helpStep4',
  'helpStep5',
  'helpStep6',
  'helpStep7',
] as const;
const HELP_TIP_KEYS = ['helpTip1', 'helpTip2', 'helpTip3'] as const;

function HelpPanel({ tr, onClose }: { tr: Tr; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 overflow-y-auto bg-white p-4 text-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-bold">{tr('helpTitle')}</h2>
        <button type="button" className="rounded border px-2 py-1" onClick={onClose}>
          {tr('helpClose')}
        </button>
      </div>

      <h3 className="mt-2 font-medium">{tr('helpStepsTitle')}</h3>
      <ol className="mt-1 list-decimal space-y-1 pl-5">
        {HELP_STEP_KEYS.map((k) => (
          <li key={k}>{tr(k)}</li>
        ))}
      </ol>

      <h3 className="mt-3 font-medium">{tr('helpTipsTitle')}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-600">
        {HELP_TIP_KEYS.map((k) => (
          <li key={k}>{tr(k)}</li>
        ))}
      </ul>

      <button type="button" className="mt-3 text-blue-700 underline" onClick={() => void openCalculator()}>
        {tr('helpOpenCalculator')}
      </button>
    </div>
  );
}
