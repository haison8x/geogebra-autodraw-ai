// Load + format the minified command catalog at runtime (Popup) — spec §6.2.
// public/geometry_commands.min.json is generated at build time (scripts/gen-min-commands.mjs).

export type MinCommand = { name: string; syntax: string; description: string };

let cache: MinCommand[] | null = null;

export async function loadMinCommands(): Promise<MinCommand[]> {
  if (cache) return cache;
  const url = chrome.runtime.getURL('geometry_commands.min.json');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load command catalog (${res.status})`);
  cache = (await res.json()) as MinCommand[];
  return cache;
}

// Keep this format in sync with scripts/minify-core.mjs:formatCatalog.
export function formatCatalog(commands: MinCommand[]): string {
  return commands
    .map((c) => `- ${c.name}: ${c.syntax}${c.description ? ` — ${c.description}` : ''}`)
    .join('\n');
}
