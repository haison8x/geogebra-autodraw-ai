// Clean up the command list returned by the AI — spec §10.1.
// Strip code fences, numbering/bullet prefixes, trim, drop empty lines, and drop any
// stray prose the model may have leaked (some "thinking" models emit reasoning lines
// like "Actually, if we define:" alongside the commands).

const FENCE_RE = /^```.*$/; // ```geogebra or ```
const PREFIX_RE = /^\s*(?:\d+[.)]|[-*•])\s+/; // "1. ", "2) ", "- ", "* ", "• "

// A line is kept only if it has the shape of a GeoGebra command:
//   • an assignment:   Name = …            (Name may carry a _{…} or _n subscript)
//   • a bare call:     CommandName( … )    (GeoGebra command names are Uppercase-first)
// This drops natural-language lines (they have neither an `Identifier =` head nor an
// `UppercaseName(` head) while keeping every real command, e.g. `A = (0,0)`,
// `a = Segment(B,C)`, `ShowLabel(a, false)`, `Polygon(A,B,C)`.
const ASSIGNMENT_RE = /^[A-Za-z][\w{}]*\s*=(?!=)/; // Name = …  (not == )
const CALL_RE = /^[A-Z][A-Za-z0-9]*\(/; // CommandName( …

function looksLikeCommand(line: string): boolean {
  if (ASSIGNMENT_RE.test(line)) return true;
  if (CALL_RE.test(line.replace(/\s+/g, ''))) return true;
  return false;
}

export function sanitizeCommands(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !FENCE_RE.test(line))
    .map((line) => line.replace(PREFIX_RE, '').trim())
    .filter((line) => line.length > 0)
    .filter(looksLikeCommand);
}
