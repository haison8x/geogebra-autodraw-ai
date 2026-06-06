export const CALC_URL = 'https://www.geogebra.org/calculator';
export const isCalc = (url?: string) => url?.startsWith(CALC_URL) ?? false;

// Open the Calculator: focus an existing tab, else create one.
export async function openCalculator(): Promise<void> {
  try {
    const existing = await chrome.tabs.query({ url: `${CALC_URL}*` });
    const tab = existing[0];
    if (tab?.id != null) {
      await chrome.tabs.update(tab.id, { active: true });
      if (tab.windowId != null) await chrome.windows.update(tab.windowId, { focused: true });
    } else {
      await chrome.tabs.create({ url: CALC_URL });
    }
  } catch (e) {
    console.error('openCalculator failed', e);
  }
}
