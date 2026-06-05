// SPIKE P3 — content script chay world:"MAIN" co thay window.ggbApplet khong?
// Doc log o Console cua TAB GeoGebra (khong phai console popup/background).
// KET QUA (2026-06-05): thay ggbApplet sau 2 lan poll, evalCommand + reset() chay. PASS.
console.log('[CS] world test start. world =', window.ggbApplet === undefined ? 'co the ISOLATED' : 'co bien page');

let tries = 0;
const timer = setInterval(() => {
  tries++;
  if (window.ggbApplet && typeof window.ggbApplet.evalCommand === 'function') {
    clearInterval(timer);
    console.log('[CS] ggbApplet THAY DUOC sau', tries, 'lan poll');

    const ok = window.ggbApplet.evalCommand('A = (0, 0)');
    console.log('[CS] evalCommand("A = (0,0)") ->', ok, '— kiem tra diem A tren man hinh');

    if (typeof window.ggbApplet.reset === 'function') {
      console.log('[CS] reset() kha dung — nut "Xoa hinh" lam duoc');
    }

    console.log('%c[CS] KET LUAN: §7.1 KHA THI trong content script world:MAIN ✅',
                'color:#0a0;font-weight:bold;font-size:13px');
  } else if (tries > 50) {  // ~15s
    clearInterval(timer);
    console.log('%c[CS] TIMEOUT ❌ — KHONG thay ggbApplet sau 15s.',
                'color:#c00;font-weight:bold;font-size:13px');
    console.log('[CS] Neu da khai bao world:"MAIN" ma van fail -> applet trong iframe khac origin / shadow DOM, can chien luoc khac.');
  }
}, 300);
