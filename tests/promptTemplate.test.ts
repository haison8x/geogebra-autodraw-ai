import { describe, it, expect } from 'vitest';
import { buildPrompt, PROMPT_TEMPLATE } from '../src/shared/promptTemplate';

describe('buildPrompt', () => {
  it('replaces {{PROBLEM}} with the (trimmed) problem', () => {
    const out = buildPrompt('  Triangle ABC  ', 'CATALOG');
    expect(out).toContain('Triangle ABC');
    expect(out).not.toContain('{{PROBLEM}}');
  });

  it('replaces {{COMMANDS_CATALOG}} with the catalog', () => {
    const out = buildPrompt('problem', '- Polygon: Polygon(...)');
    expect(out).toContain('- Polygon: Polygon(...)');
    expect(out).not.toContain('{{COMMANDS_CATALOG}}');
  });

  it('keeps the English-command-names constraint', () => {
    expect(PROMPT_TEMPLATE).toMatch(/English command names/);
    const out = buildPrompt('x', 'y');
    expect(out).toMatch(/English command names/);
  });
});
