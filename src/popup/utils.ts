export const CALC_URL = 'https://www.geogebra.org/calculator';
export const isCalc = (url?: string) => url?.startsWith(CALC_URL) ?? false;

// True when at least one Calculator tab exists in any window (the Background can act on it,
// even if it is not the active tab — see findCalcTab() in the service worker).
export async function hasCalculatorTab(): Promise<boolean> {
  try {
    const tabs = await chrome.tabs.query({ url: `${CALC_URL}*` });
    return tabs.length > 0;
  } catch {
    return false;
  }
}

// Resolve once the tab has finished loading (so executeScript can inject into it).
function waitForTabComplete(tabId: number, timeoutMs = 20_000): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      chrome.tabs.onUpdated.removeListener(listener);
      clearTimeout(timer);
      resolve();
    };
    const listener = (id: number, info: { status?: string }) => {
      if (id === tabId && info.status === 'complete') finish();
    };
    const timer = setTimeout(finish, timeoutMs);
    chrome.tabs.onUpdated.addListener(listener);
    chrome.tabs.get(tabId).then((t) => {
      if (t.status === 'complete') finish();
    }, finish);
  });
}

// Make sure a Calculator tab exists and is ready: focus an existing one, else create + await load.
// Returns its tab id, or null when it could not be opened.
export async function ensureCalculatorTab(): Promise<number | null> {
  try {
    const existing = await chrome.tabs.query({ url: `${CALC_URL}*` });
    const tab = existing[0];
    if (tab?.id != null) {
      await chrome.tabs.update(tab.id, { active: true });
      if (tab.windowId != null) await chrome.windows.update(tab.windowId, { focused: true });
      return tab.id;
    }
    const created = await chrome.tabs.create({ url: CALC_URL });
    if (created.id == null) return null;
    await waitForTabComplete(created.id);
    return created.id;
  } catch (e) {
    console.error('ensureCalculatorTab failed', e);
    return null;
  }
}

// Open the Calculator: focus an existing tab, else create one.
export async function openCalculator(): Promise<void> {
  await ensureCalculatorTab();
}
