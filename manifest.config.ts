import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  name: '__MSG_appName__',
  default_locale: 'en',
  version: pkg.version,
  description: '__MSG_appDesc__',
  icons: {
    16: 'icons/icon16.png',
    32: 'icons/icon32.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png',
  },
  // No default_popup → clicking the action toggles the side panel (see service worker).
  action: {
    default_icon: {
      16: 'icons/icon16.png',
      32: 'icons/icon32.png',
      48: 'icons/icon48.png',
      128: 'icons/icon128.png',
    },
  },
  side_panel: { default_path: 'src/popup/index.html' },
  background: { service_worker: 'src/background/service-worker.ts', type: 'module' },
  // 'scripting' → run ggbApplet.evalCommand in the page's MAIN world via executeScript.
  permissions: ['tabs', 'storage', 'sidePanel', 'scripting'],
  host_permissions: ['https://www.geogebra.org/*'],
});
