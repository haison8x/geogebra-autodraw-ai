import { describe, it, expect } from 'vitest';
import { buildPrompt, PROMPT_TEMPLATE, buildPrompt1, PROMPT_TEMPLATE_1, buildPrompt2, PROMPT_TEMPLATE_2 } from '../src/shared/promptTemplate';

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

describe('buildPrompt1', () => {
  it('replaces {{PROBLEM}} with the (trimmed) problem', () => {
    const out = buildPrompt1('  Triangle ABC  ');
    expect(out).toContain('Triangle ABC');
    expect(out).not.toContain('{{PROBLEM}}');
  });

  it('does not contain {{COMMANDS_CATALOG}} placeholder', () => {
    const out = buildPrompt1('problem');
    expect(out).not.toContain('{{COMMANDS_CATALOG}}');
  });

  it('does not contain GeoGebra command syntax — asks for a plan only', () => {
    expect(PROMPT_TEMPLATE_1).toMatch(/CONSTRUCTION PLAN/);
    expect(PROMPT_TEMPLATE_1).toMatch(/Do NOT write any GeoGebra commands/);
  });
});

describe('buildPrompt2', () => {
  it('replaces {{INTERPRETATION}} with the (trimmed) plan', () => {
    const out = buildPrompt2('  free point A at (-1,6)  ', 'CATALOG');
    expect(out).toContain('free point A at (-1,6)');
    expect(out).not.toContain('{{INTERPRETATION}}');
  });

  it('replaces {{COMMANDS_CATALOG}} with the catalog', () => {
    const out = buildPrompt2('plan', '- Polygon: Polygon(...)');
    expect(out).toContain('- Polygon: Polygon(...)');
    expect(out).not.toContain('{{COMMANDS_CATALOG}}');
  });

  it('keeps the English-command-names constraint', () => {
    expect(PROMPT_TEMPLATE_2).toMatch(/English command names/);
    const out = buildPrompt2('plan', 'catalog');
    expect(out).toMatch(/English command names/);
  });

  it('does not contain {{PROBLEM}} placeholder', () => {
    const out = buildPrompt2('plan', 'catalog');
    expect(out).not.toContain('{{PROBLEM}}');
  });
});
