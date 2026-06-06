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
import { t, type Locale } from '@/shared/i18n';
import { isCalc } from '../utils';
import type { Phase } from '../types';

function getErrorLineRange(raw: string, commandIndex: number): { start: number; end: number } | null {
  const lines = raw.split('\n');
  let count = 0;
  let pos = 0;
  for (const line of lines) {
    if (line.trim()) {
      if (count === commandIndex) return { start: pos, end: pos + line.length };
      count++;
    }
    pos += line.length + 1;
  }
  return null;
}

export function useAppState() {
  const [problem, setProblem] = useState('');
  const [commandsRaw, setCommandsRaw] = useState('');
  const [clearFirst, setClearFirst] = useState(true);
  const [locale, setLocale] = useState<Locale>('en');
  const [catalog, setCatalog] = useState('');
  const [catalogErr, setCatalogErr] = useState('');
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState({ index: 0, total: 0 });
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [onCalc, setOnCalc] = useState(true);

  const restored = useRef(false);
  const commandsRawRef = useRef('');
  const commandsTextareaRef = useRef<HTMLTextAreaElement>(null);

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
        case 'COMMAND_ERROR': {
          setErrors((prev) => [...prev, msg.payload]);
          setPhase('done');
          const range = getErrorLineRange(commandsRawRef.current, msg.payload.index);
          if (range && commandsTextareaRef.current) {
            commandsTextareaRef.current.focus();
            commandsTextareaRef.current.setSelectionRange(range.start, range.end);
          }
          break;
        }
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

  useEffect(() => {
    commandsRawRef.current = commandsRaw;
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

  const handleCopyPrompt = useCallback(async () => {
    if (!problem.trim() || !catalog) return;
    try {
      await navigator.clipboard.writeText(buildPrompt(problem, catalog));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('clipboard failed', e);
    }
  }, [problem, catalog]);

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

  return {
    problem,
    setProblem,
    commandsRaw,
    setCommandsRaw,
    clearFirst,
    locale,
    catalog,
    catalogErr,
    copied,
    showHelp,
    setShowHelp,
    phase,
    progress,
    errors,
    history,
    onCalc,
    tr,
    commandCount,
    canExecute,
    handleCopyPrompt,
    handlePasteCommands,
    handleClearCommands,
    setMode,
    changeLocale,
    handleExecute,
    handleClearCanvas,
    loadHistory,
    commandsTextareaRef,
  };
}
