// Popup UI — spec §3.1, §6, §10.1, §12, §16, §18. Two prompt modes: Flash (1-step) and Advanced (2-step).
// Fully localized (Epic 6) via t(locale, key).
import { SUPPORTED_LOCALES, LOCALE_NATIVE_NAMES, type Locale } from '@/shared/i18n';
import type { PromptMode } from '@/shared/storage';
import { SAMPLES, samplesByGroup } from '@/shared/samples';
import { useAppState } from './hooks/useAppState';
import { StatusPanel } from './components/StatusPanel';
import { HelpPanel } from './components/HelpPanel';
import { openCalculator } from './utils';

export default function App() {
  const {
    problem,
    setProblem,
    interpretation,
    setInterpretation,
    commandsRaw,
    setCommandsRaw,
    clearFirst,
    locale,
    promptMode,
    catalog,
    catalogErr,
    copied,
    copied1,
    copied2,
    showHelp,
    setShowHelp,
    phase,
    progress,
    errors,
    history,
    hasCalcTab,
    openingCalc,
    tr,
    commandCount,
    canExecute,
    handleCopyPrompt,
    handleCopyPrompt1,
    handleCopyPrompt2,
    handlePasteCommands,
    handleClearCommands,
    setMode,
    changeLocale,
    changePromptMode,
    handleExecute,
    handleClearCanvas,
    loadHistory,
    commandsTextareaRef,
  } = useAppState();

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

      {showHelp && <HelpPanel tr={tr} promptMode={promptMode} onClose={() => setShowHelp(false)} />}

      {/* Note: prompt is still being tuned — set expectations + how to get better results */}
      <details className="rounded border border-sky-300 bg-sky-50 p-2 text-xs text-sky-900" open>
        <summary className="cursor-pointer font-medium">ℹ️ {tr('noteTitle')}</summary>
        <p className="mt-1">{tr('noteBody')}</p>
        <ul className="mt-1 list-disc space-y-1 pl-4">
          <li>{tr('noteTip1')}</li>
          <li>{tr('noteTip2')}</li>
        </ul>
      </details>

      {/* Guidance banner — no Calculator tab yet; Execute (Draw) opens one automatically */}
      {!hasCalcTab && (
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

      {/* 1. Problem (with a sample-problem picker) */}
      <label className="block">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">{tr('problemLabel')}</span>
          <select
            className="max-w-[60%] rounded border px-1 py-0.5 text-xs"
            aria-label={tr('samplesLabel')}
            value=""
            onChange={(e) => {
              const s = SAMPLES.find((x) => x.id === e.target.value);
              if (s) setProblem(s.problem);
              e.target.value = '';
            }}
          >
            <option value="" disabled>
              {tr('samplesPlaceholder')}
            </option>
            {samplesByGroup().map(({ group, items }) => (
              <optgroup key={group} label={group === 'Basic examples' ? tr('samplesBasicGroup') : group}>
                {items.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <textarea
          className="mt-1 w-full rounded border p-2"
          rows={4}
          placeholder={tr('problemPlaceholder')}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
        />
      </label>

      {/* 2. Prompt mode toggle */}
      <fieldset className="flex items-center gap-3">
        <legend className="text-xs font-medium text-slate-600">{tr('promptModeLabel')}:</legend>
        <label className="flex items-center gap-1 text-xs">
          <input
            type="radio"
            name="promptMode"
            checked={promptMode === 'flash'}
            onChange={() => changePromptMode('flash' as PromptMode)}
          />
          {tr('promptModeFlash')}
        </label>
        <label className="flex items-center gap-1 text-xs">
          <input
            type="radio"
            name="promptMode"
            checked={promptMode === 'advanced'}
            onChange={() => changePromptMode('advanced' as PromptMode)}
          />
          {tr('promptModeAdvanced')}
        </label>
      </fieldset>

      {/* 3a. Flash mode: single Generate Prompt button */}
      {promptMode === 'flash' && (
        <>
          <button
            className="w-full rounded bg-emerald-600 px-3 py-2 font-medium text-white disabled:opacity-50"
            disabled={!problem.trim() || !catalog}
            onClick={handleCopyPrompt}
          >
            {copied ? tr('copied') : tr('copyPrompt')}
          </button>
          {catalogErr && <p className="text-xs text-red-600">{tr('catalogError', { error: catalogErr })}</p>}
        </>
      )}

      {/* 3b. Advanced mode: Prompt 1 → interpretation textarea → Prompt 2 */}
      {promptMode === 'advanced' && (
        <>
          <button
            className="w-full rounded bg-emerald-600 px-3 py-2 font-medium text-white disabled:opacity-50"
            disabled={!problem.trim()}
            onClick={handleCopyPrompt1}
          >
            {copied1 ? tr('copied') : tr('copyPrompt1')}
          </button>

          <label className="block">
            <span className="font-medium">{tr('interpretationLabel')}</span>
            <textarea
              className="mt-1 w-full rounded border p-2 text-xs"
              rows={5}
              placeholder={tr('interpretationPlaceholder')}
              value={interpretation}
              onChange={(e) => setInterpretation(e.target.value)}
            />
          </label>

          <button
            className="w-full rounded bg-teal-600 px-3 py-2 font-medium text-white disabled:opacity-50"
            disabled={!interpretation.trim() || !catalog}
            onClick={handleCopyPrompt2}
          >
            {copied2 ? tr('copied') : tr('copyPrompt2')}
          </button>
          {catalogErr && <p className="text-xs text-red-600">{tr('catalogError', { error: catalogErr })}</p>}
        </>
      )}

      {/* 4. GeoGebra commands (paste → sanitize → editable) */}
      <label className="block">
        <span className="font-medium">{tr('commandsLabel')}</span>
        <textarea
          ref={commandsTextareaRef}
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

      {/* 5. Draw mode */}
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

      {/* 6. Actions */}
      <div className="flex gap-2">
        <button
          className="flex-1 rounded bg-blue-600 px-3 py-2 font-medium text-white disabled:opacity-50"
          disabled={!canExecute}
          onClick={handleExecute}
        >
          {openingCalc ? tr('openingCalculator') : phase === 'running' ? tr('drawing') : tr('execute')}
        </button>
        <button
          className="rounded border border-slate-300 px-3 py-2 disabled:opacity-50"
          onClick={handleClearCanvas}
          disabled={openingCalc}
        >
          {tr('clearCanvas')}
        </button>
      </div>

      {/* 7. Status */}
      <StatusPanel phase={phase} progress={progress} errors={errors} tr={tr} />

      {/* 8. History */}
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
