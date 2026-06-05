import { describe, it, expect } from 'vitest';
import { pushHistory, HISTORY_LIMIT, type HistoryItem } from '../src/shared/storage';

const mk = (id: number): HistoryItem => ({ id: String(id), problem: `p${id}`, commands: [`c${id}`] });

describe('pushHistory', () => {
  it('appends an item at the end', () => {
    const out = pushHistory([mk(1)], mk(2));
    expect(out.map((h) => h.id)).toEqual(['1', '2']);
  });

  it('keeps ≤ HISTORY_LIMIT, FIFO drops the oldest', () => {
    let h: HistoryItem[] = [];
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) h = pushHistory(h, mk(i));
    expect(h).toHaveLength(HISTORY_LIMIT);
    expect(h[0].id).toBe('5'); // 0..4 dropped by FIFO
    expect(h[h.length - 1].id).toBe(String(HISTORY_LIMIT + 4));
  });
});
