// Background service worker — runs GeoGebra commands in the page's MAIN world via
// chrome.scripting.executeScript (no content scripts, no postMessage bridge). The side panel
// is always available; the panel UI tells the user to open a Calculator tab when needed.
import type { ErrorItem, Message } from '@/shared/messages';
import { DEFAULT_DELAY_MS } from '@/shared/messages';

const CALC_URL = 'https://www.geogebra.org/calculator';
const isCalc = (url?: string) => url?.startsWith(CALC_URL) ?? false;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Clicking the toolbar icon opens the side panel.
chrome.sidePanel?.setPanelBehavior({ openPanelOnActionClick: true }).catch((e) => {
  console.debug('setPanelBehavior failed', e);
});

chrome.runtime.onMessage.addListener((msg: Message) => {
  if (msg.action === 'EXECUTE_COMMANDS') {
    void handleExecute(msg.payload.commands, msg.payload.clearFirst);
  } else if (msg.action === 'CLEAR_CANVAS') {
    void handleClear();
  }
  return false;
});

function sendRuntime(msg: Message): void {
  try {
    void chrome.runtime.sendMessage(msg);
  } catch (e) {
    console.debug('runtime.sendMessage skipped', e);
  }
}

// Find the GeoGebra Calculator tab to act on: prefer the active tab, else any calculator tab.
async function findCalcTab(): Promise<number | null> {
  const [active] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (active && isCalc(active.url) && active.id != null) return active.id;
  const all = await chrome.tabs.query({ url: `${CALC_URL}*` });
  return all[0]?.id ?? null;
}

// --- Functions injected into the page MAIN world (must be self-contained / serializable) ---

function pageWaitApplet(): Promise<boolean> {
  return new Promise((resolve) => {
    let tries = 0;
    const tick = () => {
      // @ts-expect-error ggbApplet is injected by GeoGebra in the page
      if (window.ggbApplet && typeof window.ggbApplet.evalCommand === 'function') return resolve(true);
      if (++tries > 50) return resolve(false); // ~15s @ 300ms
      setTimeout(tick, 300);
    };
    tick();
  });
}

function pageReset(): void {
  // @ts-expect-error ggbApplet injected by GeoGebra
  window.ggbApplet?.reset();
}

function pageRunCommand(cmd: string): boolean {
  // @ts-expect-error ggbApplet injected by GeoGebra
  const g = window.ggbApplet;
  if (!g) return false;
  // Visibility commands are GeoGebra *scripting* commands (lazy-loaded) → use the JS API.
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
    return g.evalCommand(cmd);
  } catch {
    return false;
  }
}

async function execMain<T>(tabId: number, func: (...a: never[]) => T, args: unknown[] = []): Promise<T | undefined> {
  const [res] = await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: func as (...a: unknown[]) => T,
    args,
  });
  return res?.result as T | undefined;
}

async function handleExecute(commands: string[], clearFirst: boolean): Promise<void> {
  try {
    const tabId = await findCalcTab();
    if (tabId == null) {
      sendRuntime({ action: 'DONE', payload: { ok: false, executed: 0, errors: [] } });
      return;
    }

    const ready = await execMain(tabId, pageWaitApplet);
    if (!ready) {
      sendRuntime({ action: 'DONE', payload: { ok: false, executed: 0, errors: [] } });
      return;
    }

    if (clearFirst) await execMain(tabId, pageReset);

    const errors: ErrorItem[] = [];
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      const ok = await execMain(tabId, pageRunCommand, [cmd]);
      sendRuntime({ action: 'PROGRESS', payload: { index: i, total: commands.length, command: cmd } });
      if (!ok) {
        const item: ErrorItem = { index: i, command: cmd, message: 'evalCommand returned false' };
        errors.push(item);
        sendRuntime({ action: 'COMMAND_ERROR', payload: item });
        sendRuntime({ action: 'DONE', payload: { ok: false, executed: i, errors } });
        return;
      }
      await delay(DEFAULT_DELAY_MS);
    }

    sendRuntime({ action: 'DONE', payload: { ok: errors.length === 0, executed: commands.length, errors } });
  } catch (e) {
    console.error('handleExecute failed', e);
    sendRuntime({ action: 'DONE', payload: { ok: false, executed: 0, errors: [] } });
  }
}

async function handleClear(): Promise<void> {
  try {
    const tabId = await findCalcTab();
    if (tabId == null) return;
    await execMain(tabId, pageReset);
  } catch (e) {
    console.error('handleClear failed', e);
  }
}
