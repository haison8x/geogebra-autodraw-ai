import { describe, it, expect } from 'vitest';
// @ts-expect-error — build-time .mjs core, no type declarations.
import { pickSyntax, shortDescription, minifyAll, formatCatalog } from '../scripts/minify-core.mjs';

describe('pickSyntax', () => {
  it('picks the first <...> template, skips example lines', () => {
    expect(pickSyntax(['Midpoint( <Segment> )', 'Midpoint(Segment((1,1),(5,1)))'])).toBe(
      'Midpoint( <Segment> )',
    );
  });

  it('drops the trailing "yields ..." part', () => {
    expect(pickSyntax(['Angle(y = x + 2, y = 2x + 3) yields 18.43°'])).toBe(
      'Angle(y = x + 2, y = 2x + 3)',
    );
  });

  it('prefers the 2D template over the 3D one', () => {
    const syn = ['Angle(Line((-2,0,0),(0,0,2)), z = 0)', 'Angle( <Vector>, <Vector> )'];
    expect(pickSyntax(syn)).toBe('Angle( <Vector>, <Vector> )');
  });

  it('empty array -> empty string', () => {
    expect(pickSyntax([])).toBe('');
  });
});

describe('shortDescription', () => {
  it('keeps the first sentence', () => {
    expect(shortDescription('Returns the midpoint. Extra detail here.')).toBe(
      'Returns the midpoint.',
    );
  });

  it('strips the "Conic:" prefix', () => {
    expect(shortDescription('Conic: Returns the angle.')).toBe('Returns the angle.');
  });

  it('caps at ≤ 120 chars', () => {
    const long = 'A'.repeat(200);
    expect(shortDescription(long).length).toBeLessThanOrEqual(120);
  });
});

describe('minifyAll', () => {
  it('keeps name/syntax/description, drops commands without syntax', () => {
    const out = minifyAll([
      { name: 'Polygon', description: 'Draws polygon.', syntax: ['Polygon( <Point>, ... )'] },
      { name: 'Bad', description: 'no syntax', syntax: [] },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({
      name: 'Polygon',
      syntax: 'Polygon( <Point>, ... )',
      description: 'Draws polygon.',
    });
  });
});

describe('formatCatalog', () => {
  it('formats "- Name: syntax — description" per line', () => {
    const out = formatCatalog([{ name: 'Point', syntax: 'Point( <Path> )', description: 'A point.' }]);
    expect(out).toBe('- Point: Point( <Path> ) — A point.');
  });
});
