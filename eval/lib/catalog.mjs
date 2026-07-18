// eval/lib/catalog.mjs
// Build the {{COMMANDS_CATALOG}} string exactly as the extension does at build time,
// reusing the real minifier so the eval prompt matches production 1:1.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minifyAll, formatCatalog } from '../../scripts/minify-core.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

export function buildCatalogString() {
  const full = JSON.parse(readFileSync(resolve(root, 'geometry_commands.json'), 'utf8'));
  return formatCatalog(minifyAll(full));
}
