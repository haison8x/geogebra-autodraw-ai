// Generate public/geometry_commands.min.json from geometry_commands.json — spec §6.2.
// Runs before build (see package.json "prebuild") and can be run manually:
//   node scripts/gen-min-commands.mjs
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minifyAll } from './minify-core.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(root, 'geometry_commands.json');
const OUT = resolve(root, 'public/geometry_commands.min.json');

const full = JSON.parse(readFileSync(SRC, 'utf8'));
const min = minifyAll(full);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(min), 'utf8');

const before = statSync(SRC).size;
const after = statSync(OUT).size;
console.log(
  `geometry_commands.min.json: ${full.length} → ${min.length} commands, ` +
    `${before} → ${after} bytes (${Math.round((1 - after / before) * 100)}% smaller)`,
);
