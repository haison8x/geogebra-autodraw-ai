// eval/gen-commands.mjs
// For each problem: build the REAL Flash prompt, ask Gemini, sanitize the output,
// and cache the command list. Results are cached per-problem so re-running is cheap;
// only missing/failed problems are re-generated unless --force is given.
//
//   node eval/gen-commands.mjs [--force] [--limit N] [--concurrency N]
//
// Requires GEMINI_API_KEY (see eval/lib/gemini.mjs).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPrompt } from '../src/shared/promptTemplate.ts';
import { sanitizeCommands } from '../src/shared/sanitize.ts';
import { buildCatalogString } from './lib/catalog.mjs';
import { generate, assertApiKey, modelName } from './lib/gemini.mjs';

const here = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const LIMIT = numArg('--limit', Infinity);
const CONCURRENCY = numArg('--concurrency', 4);
const PROBLEMS_FILE = strArg('--problems', resolve(here, 'problems.json'));
const RESULTS_DIR = strArg('--results', resolve(here, 'results', 'flash'));

function numArg(flag, dflt) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? Number(args[i + 1]) : dflt;
}
function strArg(flag, dflt) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : dflt;
}

function resultPath(id) {
  return resolve(RESULTS_DIR, `${id}.json`);
}

async function processProblem(problem, catalog) {
  const out = resultPath(problem.id);
  if (!FORCE && existsSync(out)) {
    const cached = JSON.parse(readFileSync(out, 'utf8'));
    if (cached.commands?.length && !cached.error) return { id: problem.id, cached: true };
  }

  const prompt = buildPrompt(problem.problem, catalog);
  try {
    const raw = await generate(prompt);
    const commands = sanitizeCommands(raw);
    writeFileSync(
      out,
      JSON.stringify({ id: problem.id, problem: problem.problem, model: modelName, raw, commands }, null, 2),
      'utf8',
    );
    return { id: problem.id, count: commands.length };
  } catch (e) {
    writeFileSync(
      out,
      JSON.stringify({ id: problem.id, problem: problem.problem, model: modelName, error: String(e), commands: [] }, null, 2),
      'utf8',
    );
    return { id: problem.id, error: String(e) };
  }
}

// Simple concurrency pool.
async function pool(items, size, worker) {
  const results = [];
  let idx = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (idx < items.length) {
      const my = idx++;
      results[my] = await worker(items[my], my);
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  assertApiKey();
  mkdirSync(RESULTS_DIR, { recursive: true });

  const problems = JSON.parse(readFileSync(PROBLEMS_FILE, 'utf8')).slice(0, LIMIT);
  const catalog = buildCatalogString();
  console.log(`Generating commands for ${problems.length} problems via ${modelName} (concurrency ${CONCURRENCY})…`);

  let done = 0;
  const res = await pool(problems, CONCURRENCY, async (p) => {
    const r = await processProblem(p, catalog);
    done++;
    const tag = r.cached ? 'cache' : r.error ? 'ERROR' : `${r.count} cmds`;
    console.log(`  [${String(done).padStart(3)}/${problems.length}] ${p.id} — ${tag}`);
    return r;
  });

  const errors = res.filter((r) => r.error);
  const cached = res.filter((r) => r.cached).length;
  console.log(`\nDone. ${res.length - errors.length - cached} generated, ${cached} cached, ${errors.length} errors.`);
  if (errors.length) console.log(`Errors: ${errors.map((e) => e.id).join(', ')}`);
  console.log(`Results → ${RESULTS_DIR}`);
}

main();
