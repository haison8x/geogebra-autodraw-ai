import type { t } from '@/shared/i18n';

export type Phase = 'idle' | 'running' | 'done';
export type Tr = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => string;
