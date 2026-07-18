// eval/report.mjs
// Turn eval/report.json into (a) a console breakdown and (b) eval/report.html.
// The breakdown is designed to guide PROMPT OPTIMIZATION: it groups failures by
// category and by the specific commands/objects that went wrong, so you can see
// which construction patterns the AI keeps getting wrong.
//
//   node eval/report.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const IN_FILE = strArg('--in', resolve(here, 'report.json'));
const HTML_OUT = strArg('--html', resolve(here, 'report.html'));
function strArg(flag, dflt) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : dflt;
}

function cmdName(command) {
  // "H = Intersect(a,b)" → "Intersect"; "A = (1,2)" → "=coords"; "Polygon(...)" → "Polygon"
  const rhs = command.includes('=') ? command.split('=').slice(1).join('=').trim() : command.trim();
  const m = /^([A-Za-z]\w*)\s*\(/.exec(rhs);
  if (m) return m[1];
  if (/^\(?-?\d/.test(rhs) || /^\(/.test(rhs)) return '(coordinates)';
  return rhs.split(/[\s(]/)[0] || '(other)';
}

function bar(n, max, width = 24) {
  const filled = max ? Math.round((n / max) * width) : 0;
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function main() {
  const { summary, results } = JSON.parse(readFileSync(IN_FILE, 'utf8'));
  const graded = results.filter((r) => r.status === 'PASS' || r.status === 'FAIL');
  const fails = graded.filter((r) => r.status === 'FAIL');

  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║  GeoGebra Prompt Eval — ${summary.model.padEnd(21)}║`);
  console.log(`╚══════════════════════════════════════════════╝`);
  console.log(`  Passed: ${summary.passed}/${summary.graded}  (${summary.passRate}%)`);
  console.log(`  Failure reasons breakdown:`);
  const reasonCounts = {
    'bad syntax (command returned false)': fails.filter((f) => !f.syntaxOk).length,
    'missing / wrong-type points': fails.filter((f) => !f.pointsOk).length,
    'missing circle(s)': fails.filter((f) => !f.conicsOk).length,
  };
  for (const [k, v] of Object.entries(reasonCounts)) console.log(`    ${String(v).padStart(3)}  ${k}`);

  // ── Pass rate by category ──
  const cats = {};
  for (const r of graded) {
    const c = (cats[r.category] = cats[r.category] || { total: 0, pass: 0 });
    c.total++;
    if (r.status === 'PASS') c.pass++;
  }
  console.log(`\n  Pass rate by category (worst first):`);
  const catRows = Object.entries(cats)
    .map(([cat, c]) => ({ cat, ...c, rate: c.pass / c.total }))
    .sort((a, b) => a.rate - b.rate);
  for (const r of catRows) {
    console.log(`    ${bar(r.pass, r.total, 12)} ${String(Math.round(r.rate * 100)).padStart(3)}%  ${r.pass}/${r.total}  ${r.cat}`);
  }

  // ── Which commands fail most (drives prompt fixes) ──
  const failByCmd = {};
  for (const f of fails) {
    for (const fc of f.failedCommands || []) {
      const name = cmdName(fc.command);
      (failByCmd[name] = failByCmd[name] || { count: 0, examples: [] }).count++;
      if (failByCmd[name].examples.length < 5) failByCmd[name].examples.push(fc.command);
    }
  }
  const cmdRows = Object.entries(failByCmd).sort((a, b) => b[1].count - a[1].count);
  if (cmdRows.length) {
    console.log(`\n  Most-failing commands (candidates for prompt rules):`);
    for (const [name, info] of cmdRows.slice(0, 15)) {
      console.log(`    ${String(info.count).padStart(3)}×  ${name}`);
      console.log(`         e.g. ${info.examples[0]}`);
    }
  }

  console.log(`\n  Full details → ${HTML_OUT}\n`);

  writeHtml({ summary, results, graded, fails, catRows, cmdRows });
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function writeHtml({ summary, results, graded, fails, catRows, cmdRows }) {
  const catTable = catRows
    .map(
      (r) =>
        `<tr class="${r.rate < 1 ? 'bad' : 'good'}"><td>${esc(r.cat)}</td><td>${r.pass}/${r.total}</td><td>${Math.round(r.rate * 100)}%</td></tr>`,
    )
    .join('');

  const cmdTable = cmdRows
    .slice(0, 20)
    .map(
      ([name, info]) =>
        `<tr><td>${esc(name)}</td><td>${info.count}</td><td><code>${esc(info.examples[0])}</code></td></tr>`,
    )
    .join('');

  const failRows = fails
    .map((f) => {
      const reasons = [!f.syntaxOk && 'syntax', !f.pointsOk && 'points', !f.conicsOk && 'conics'].filter(Boolean).join(', ');
      const failedCmds = (f.failedCommands || []).map((c) => `<li><code>${esc(c.command)}</code></li>`).join('');
      const detail = [
        f.missingPoints?.length ? `missing points: ${esc(f.missingPoints.join(', '))}` : '',
        f.notPointType?.length ? `wrong-type points: ${esc(f.notPointType.join(', '))}` : '',
        !f.conicsOk ? `circles: got ${f.conicCount}, need ${f.expectedConics}` : '',
      ]
        .filter(Boolean)
        .join('<br>');
      return `<details class="fail">
        <summary><b>${esc(f.id)}</b> — <span class="tag">${reasons}</span></summary>
        <p class="prob">${esc(f.problem)}</p>
        ${detail ? `<p class="detail">${detail}</p>` : ''}
        ${failedCmds ? `<p>Failed commands:</p><ul>${failedCmds}</ul>` : ''}
        <p>All commands:</p><pre>${esc((f.commands || []).join('\n'))}</pre>
        <p>Objects created: <code>${esc((f.objectNames || []).join(', '))}</code></p>
      </details>`;
    })
    .join('');

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>GeoGebra Prompt Eval</title>
<style>
  body{font:14px/1.5 system-ui,sans-serif;max-width:960px;margin:2rem auto;padding:0 1rem;color:#1a1a1a}
  h1{margin-bottom:.2rem}.sub{color:#666;margin-top:0}
  .big{font-size:2.4rem;font-weight:700}
  table{border-collapse:collapse;width:100%;margin:.5rem 0 1.5rem}
  th,td{border:1px solid #ddd;padding:.4rem .6rem;text-align:left;vertical-align:top}
  th{background:#f4f4f4}
  tr.bad td{background:#fff2f2}tr.good td{background:#f2fff4}
  code{background:#f4f4f4;padding:.05rem .3rem;border-radius:3px;font-size:.85em}
  pre{background:#f8f8f8;border:1px solid #eee;padding:.6rem;overflow:auto;font-size:.82em}
  details.fail{border:1px solid #f0c0c0;border-radius:6px;padding:.5rem .8rem;margin:.5rem 0;background:#fffafa}
  summary{cursor:pointer}.tag{color:#c0392b;font-size:.85em}
  .prob{color:#333;font-style:italic}.detail{color:#c0392b}
</style></head><body>
<h1>GeoGebra Prompt Eval</h1>
<p class="sub">${esc(summary.model)} · ${esc(summary.generatedAt)} · ${esc(summary.url)}</p>
<p class="big">${summary.passed}/${summary.graded} <span style="font-size:1rem;color:#666">passed (${summary.passRate}%)</span></p>

<h2>Pass rate by category</h2>
<table><tr><th>Category</th><th>Pass</th><th>Rate</th></tr>${catTable}</table>

<h2>Most-failing commands</h2>
<p class="sub">Commands GeoGebra rejected — the clearest signal for what prompt rules to add/fix.</p>
<table><tr><th>Command</th><th>Fails</th><th>Example</th></tr>${cmdTable || '<tr><td colspan=3>none 🎉</td></tr>'}</table>

<h2>Failures (${fails.length})</h2>
${failRows || '<p>No failures 🎉</p>'}
</body></html>`;

  writeFileSync(HTML_OUT, html, 'utf8');
}

main();
