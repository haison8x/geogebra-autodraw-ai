import type { Tr } from '../types';
import { openCalculator } from '../utils';

const HELP_STEP_KEYS = [
  'helpStep1',
  'helpStep2',
  'helpStep3',
  'helpStep4',
  'helpStep5',
  'helpStep6',
  'helpStep7',
] as const;
const HELP_TIP_KEYS = ['helpTip1', 'helpTip2', 'helpTip3', 'helpTip4'] as const;

export function HelpPanel({ tr, onClose }: { tr: Tr; onClose: () => void }) {
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
