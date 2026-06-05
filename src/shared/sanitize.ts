// Clean up the command list returned by the AI — spec §10.1.
// Strip code fences, numbering/bullet prefixes, trim, drop empty lines.

const FENCE_RE = /^```.*$/; // ```geogebra or ```
const PREFIX_RE = /^\s*(?:\d+[.)]|[-*•])\s+/; // "1. ", "2) ", "- ", "* ", "• "

export function sanitizeCommands(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !FENCE_RE.test(line))
    .map((line) => line.replace(PREFIX_RE, '').trim())
    .filter((line) => line.length > 0);
}
