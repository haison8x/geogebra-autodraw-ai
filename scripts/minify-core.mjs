// Catalog minification core — spec §6.2. Build-time. Pure functions → testable.
// Input: [{ name, url, description, syntax[] }]. Minified output: { name, syntax, description }.

// 3D-only / irrelevant commands → excluded. (geometry_commands.json is already 2D-filtered;
// this set is a backstop in case any 3D command slips in.)
const EXCLUDE_3D = new Set([]);

// Pick one "main" syntax line = a template containing <...>, not a concrete example, not 3D.
export function pickSyntax(syntaxArr) {
  if (!Array.isArray(syntaxArr) || syntaxArr.length === 0) return '';
  const isTemplate = (s) => /<[^>]+>/.test(s);
  const is3D = (s) => /,\s*-?\d+(?:\.\d+)?\s*\)\s*,\s*\(.*,.*,/.test(s) || /\bPlane\b|\bz\s*=/.test(s);
  // Prefer the first 2D template.
  const template2d = syntaxArr.find((s) => isTemplate(s) && !is3D(s));
  if (template2d) return cleanSyntax(template2d);
  const anyTemplate = syntaxArr.find(isTemplate);
  if (anyTemplate) return cleanSyntax(anyTemplate);
  return cleanSyntax(syntaxArr[0]);
}

// Drop the trailing explanation ("... yields ..."), collapse whitespace.
function cleanSyntax(s) {
  return String(s)
    .replace(/\s+yields\b.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Short description: first sentence, drop "Conic:"/"Returns the" prefix, cap at ≤ 120 chars.
export function shortDescription(desc) {
  if (!desc) return '';
  let d = String(desc).replace(/\s+/g, ' ').trim();
  d = d.replace(/^[A-Z][a-z]+:\s*/, ''); // "Conic: ", "Point: " ...
  const dot = d.indexOf('. ');
  if (dot !== -1) d = d.slice(0, dot + 1);
  if (d.length > 120) d = d.slice(0, 117).trimEnd() + '…';
  return d.trim();
}

export function minifyCommand(cmd) {
  return {
    name: cmd.name,
    syntax: pickSyntax(cmd.syntax),
    description: shortDescription(cmd.description),
  };
}

export function minifyAll(commands) {
  return commands
    .filter((c) => c && c.name && !EXCLUDE_3D.has(c.name))
    .map(minifyCommand)
    .filter((c) => c.syntax.length > 0);
}

// Format the catalog text embedded in the prompt (§6.3 {{COMMANDS_CATALOG}}).
export function formatCatalog(minCommands) {
  return minCommands
    .map((c) => `- ${c.name}: ${c.syntax}${c.description ? ` — ${c.description}` : ''}`)
    .join('\n');
}
