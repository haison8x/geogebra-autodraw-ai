import type { ErrorItem } from '@/shared/messages';
import type { Phase, Tr } from '../types';

export function StatusPanel({
  phase,
  progress,
  errors,
  tr,
}: {
  phase: Phase;
  progress: { index: number; total: number };
  errors: ErrorItem[];
  tr: Tr;
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
