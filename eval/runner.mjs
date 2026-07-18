// eval/runner.mjs
// Automated grader. Loads a headless GeoGebra applet once, then for every problem:
//   1. reset() the applet
//   2. run each command through the SAME routing the extension uses
//      (ShowLabel/SetVisibleInView/SetVisible → JS API; everything else → evalCommand)
//   3. grade against ground truth:
//        - syntaxOk   : no command returned false
//        - pointsOk   : every expectedPoint exists, is defined, and is of type "point"
//        - conicsOk   : number of conic/circle objects >= expectedConics
//   PASS = syntaxOk && pointsOk && conicsOk
//
//   node eval/runner.mjs [--limit N] [--headed] [--url <geogebra url>] [--keep-going=false]
//
// Output: eval/report.json  (consumed by eval/report.mjs)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const LIMIT = numArg('--limit', Infinity);
const HEADED = args.includes('--headed');
const URL = strArg('--url', 'https://www.geogebra.org/calculator');
const PROBLEMS_FILE = strArg('--problems', resolve(here, 'problems.json'));
const RESULTS_DIR = strArg('--results', resolve(here, 'results', 'flash'));
const OUT_FILE = strArg('--out', resolve(here, 'report.json'));
// By default we KEEP RUNNING after a bad command so we can still inspect the final
// object state (richer diagnostics than production, which stops on first error).
const KEEP_GOING = strArg('--keep-going', 'true') !== 'false';

function numArg(flag, dflt) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? Number(args[i + 1]) : dflt;
}
function strArg(flag, dflt) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : dflt;
}

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    console.error('\n✗ Playwright is not installed. Run:\n    pnpm add -D playwright\n    npx playwright install chromium\n');
    process.exit(1);
  }
}

// NOTE: the command-execution + inspection logic lives inline in the page.evaluate
// call below. It mirrors src/background/service-worker.ts:pageRunCommand exactly
// (ShowLabel/SetVisibleInView/SetVisible routed to the JS API; else evalCommand).

async function main() {
  const { chromium } = await loadPlaywright();
  const problems = JSON.parse(readFileSync(PROBLEMS_FILE, 'utf8')).slice(0, LIMIT);

  const browser = await chromium.launch({ headless: !HEADED });
  const page = await browser.newPage();
  console.log(`Loading GeoGebra: ${URL} …`);
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(
    () => window.ggbApplet && typeof window.ggbApplet.evalCommand === 'function',
    { timeout: 60000 },
  );
  console.log('GeoGebra applet ready.\n');

  const results = [];
  let pass = 0;
  for (let i = 0; i < problems.length; i++) {
    const p = problems[i];
    const rp = resolve(RESULTS_DIR, `${p.id}.json`);
    if (!existsSync(rp)) {
      console.log(`  [${i + 1}/${problems.length}] ${p.id} — SKIP (no generated commands; run gen-commands.mjs)`);
      results.push({ ...p, status: 'NO_COMMANDS' });
      continue;
    }
    const gen = JSON.parse(readFileSync(rp, 'utf8'));
    const commands = gen.commands || [];

    let raw;
    try {
      raw = await page.evaluate(
        ([cmds, kg]) => {
          const g = window.ggbApplet;
          const runOne = (cmd) => {
            const label = /^ShowLabel\(\s*(.+?)\s*,\s*(true|false)\s*\)$/i.exec(cmd);
            if (label) {
              try {
                g.setLabelVisible(label[1], label[2].toLowerCase() === 'true');
                return true;
              } catch {
                return false;
              }
            }
            const vis =
              /^SetVisibleInView\(\s*(.+?)\s*,\s*\d+\s*,\s*(true|false)\s*\)$/i.exec(cmd) ||
              /^SetVisible\(\s*(.+?)\s*,\s*(true|false)\s*\)$/i.exec(cmd);
            if (vis) {
              try {
                g.setVisible(vis[1], vis[vis.length - 1].toLowerCase() === 'true');
                return true;
              } catch {
                return false;
              }
            }
            try {
              return g.evalCommand(cmd) === true;
            } catch {
              return false;
            }
          };
          g.reset();
          const failed = [];
          for (let j = 0; j < cmds.length; j++) {
            const ok = runOne(cmds[j]);
            if (!ok) {
              failed.push({ index: j, command: cmds[j] });
              if (!kg) break;
            }
          }
          const names = g.getAllObjectNames() || [];
          const types = {};
          for (const n of names) types[n] = g.getObjectType(n);
          return { failed, names, types };
        },
        [commands, KEEP_GOING],
      );
    } catch (e) {
      results.push({ ...p, status: 'PAGE_ERROR', error: String(e), commands });
      console.log(`  [${i + 1}/${problems.length}] ${p.id} — PAGE_ERROR`);
      continue;
    }

    // Grade.
    const pointDetails = p.expectedPoints.map((name) => {
      const type = raw.types[name];
      return { name, exists: type != null, isPoint: type === 'point' };
    });
    const missingPoints = pointDetails.filter((d) => !d.exists).map((d) => d.name);
    const notPointType = pointDetails.filter((d) => d.exists && !d.isPoint).map((d) => d.name);
    // GeoGebra reports a circle's type as "circle" (ellipse/parabola → "conic").
    const CONIC_TYPES = new Set(['circle', 'conic']);
    const conicCount = Object.values(raw.types).filter((t) => CONIC_TYPES.has(t)).length;

    const syntaxOk = raw.failed.length === 0;
    const pointsOk = missingPoints.length === 0 && notPointType.length === 0;
    const conicsOk = conicCount >= p.expectedConics;
    const ok = syntaxOk && pointsOk && conicsOk;
    if (ok) pass++;

    results.push({
      id: p.id,
      category: p.category,
      problem: p.problem,
      expectedPoints: p.expectedPoints,
      expectedConics: p.expectedConics,
      commandCount: commands.length,
      status: ok ? 'PASS' : 'FAIL',
      syntaxOk,
      pointsOk,
      conicsOk,
      failedCommands: raw.failed,
      missingPoints,
      notPointType,
      conicCount,
      objectNames: raw.names,
      commands,
    });

    const flags = ok ? 'PASS' : `FAIL [${[!syntaxOk && 'syntax', !pointsOk && 'points', !conicsOk && 'conics'].filter(Boolean).join(',')}]`;
    console.log(`  [${i + 1}/${problems.length}] ${p.id} — ${flags}`);
  }

  await browser.close();

  const graded = results.filter((r) => r.status === 'PASS' || r.status === 'FAIL');
  const summary = {
    model: readModel(),
    url: URL,
    total: results.length,
    graded: graded.length,
    passed: pass,
    passRate: graded.length ? Math.round((pass / graded.length) * 1000) / 10 : 0,
    generatedAt: new Date().toISOString(),
  };
  writeFileSync(OUT_FILE, JSON.stringify({ summary, results }, null, 2), 'utf8');

  console.log(`\n═══ RESULT ═══`);
  console.log(`  Passed ${pass}/${graded.length} (${summary.passRate}%)`);
  console.log(`  Report → ${OUT_FILE}   (run: node eval/report.mjs for HTML + breakdown)`);
}

function readModel() {
  try {
    const anyResult = JSON.parse(readFileSync(resolve(RESULTS_DIR, existsFirst()), 'utf8'));
    return anyResult.model || 'unknown';
  } catch {
    return 'unknown';
  }
}
function existsFirst() {
  const problems = JSON.parse(readFileSync(PROBLEMS_FILE, 'utf8'));
  for (const p of problems) if (existsSync(resolve(RESULTS_DIR, `${p.id}.json`))) return `${p.id}.json`;
  return '__none__.json';
}

main();
