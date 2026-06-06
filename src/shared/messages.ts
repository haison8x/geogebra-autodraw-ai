// Centralized message-passing types — spec §5. Do not hardcode action strings elsewhere.
// Execution runs in the page MAIN world via chrome.scripting.executeScript (no content scripts).

export type ErrorItem = { index: number; command: string; message: string };

export type Message =
  | { action: 'EXECUTE_COMMANDS'; payload: { commands: string[]; clearFirst: boolean } }
  | { action: 'CLEAR_CANVAS'; payload: Record<string, never> }
  | { action: 'PROGRESS'; payload: { index: number; total: number; command: string } }
  | { action: 'COMMAND_ERROR'; payload: ErrorItem }
  | { action: 'DONE'; payload: { ok: boolean; executed: number; errors: ErrorItem[] } };

export type MessageAction = Message['action'];

export const DEFAULT_DELAY_MS = 50;
export const GEOGEBRA_URL = 'https://www.geogebra.org/calculator';
