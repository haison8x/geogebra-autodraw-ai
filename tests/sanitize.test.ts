import { describe, it, expect } from 'vitest';
import { sanitizeCommands } from '../src/shared/sanitize';

describe('sanitizeCommands', () => {
  it('splits by line and trims', () => {
    expect(sanitizeCommands('  A = (0,0) \n B = (4,0) ')).toEqual(['A = (0,0)', 'B = (4,0)']);
  });

  it('drops empty lines', () => {
    expect(sanitizeCommands('A = (0,0)\n\n\nB = (1,1)')).toEqual(['A = (0,0)', 'B = (1,1)']);
  });

  it('removes code fences ``` and ```geogebra', () => {
    const raw = '```geogebra\nA = (0,0)\nPolygon(A,B,C)\n```';
    expect(sanitizeCommands(raw)).toEqual(['A = (0,0)', 'Polygon(A,B,C)']);
  });

  it('removes numbering prefixes 1. 2)', () => {
    expect(sanitizeCommands('1. A = (0,0)\n2) B = (4,0)')).toEqual(['A = (0,0)', 'B = (4,0)']);
  });

  it('removes bullets - * •', () => {
    expect(sanitizeCommands('- A = (0,0)\n* B = (1,1)\n• C = (2,2)')).toEqual([
      'A = (0,0)',
      'B = (1,1)',
      'C = (2,2)',
    ]);
  });

  it('empty string -> empty array', () => {
    expect(sanitizeCommands('')).toEqual([]);
    expect(sanitizeCommands('\n  \n')).toEqual([]);
  });
});
