/**
 * SPIKE §7.1 — Kiểm tra GeoGebra Apps API (window.ggbApplet.evalCommand)
 *
 * CÁCH DÙNG:
 * 1. Mở https://www.geogebra.org/calculator , chờ load xong (thấy lưới tọa độ).
 * 2. F12 -> tab Console.
 * 3. Paste TOÀN BỘ file này, Enter.
 * 4. Đọc log. Nếu thấy tam giác ABC vẽ ra -> §7.1 KHẢ THI.
 *
 * Lưu ý: Console chạy ở MAIN world cùng page nên truy cập được window.ggbApplet.
 * Content script muốn truy cập phải dùng world:"MAIN" (xem README §7.2).
 *
 * KẾT QUẢ (2026-06-05): KHẢ THI ✅ — evalCommand vẽ tam giác ABC, 4 lệnh -> true.
 */
(async () => {
  const log = (...a) => console.log('%c[SPIKE]', 'color:#0a0;font-weight:bold', ...a);
  const err = (...a) => console.log('%c[SPIKE]', 'color:#c00;font-weight:bold', ...a);

  function findApplet() {
    if (window.ggbApplet && typeof window.ggbApplet.evalCommand === 'function') {
      return { applet: window.ggbApplet, where: 'window.ggbApplet' };
    }
    for (const f of Array.from(document.querySelectorAll('iframe'))) {
      try {
        const w = f.contentWindow;
        if (w && w.ggbApplet && typeof w.ggbApplet.evalCommand === 'function') {
          return { applet: w.ggbApplet, where: 'iframe.contentWindow.ggbApplet' };
        }
      } catch (e) { /* cross-origin -> bỏ qua */ }
    }
    return null;
  }

  const TIMEOUT = 15000, INTERVAL = 300;
  let found = null;
  const start = performance.now();
  while (performance.now() - start < TIMEOUT) {
    found = findApplet();
    if (found) break;
    await new Promise((r) => setTimeout(r, INTERVAL));
  }

  if (!found) {
    err('KHÔNG tìm thấy ggbApplet sau 15s. §7.1 có thể KHÔNG khả thi (iframe khác origin / shadow DOM).');
    return;
  }

  const ggb = found.applet;
  log('Tìm thấy applet tại:', found.where);

  const methods = ['evalCommand', 'evalCommandGetLabels', 'setCoordSystem', 'deleteObject',
                   'getObjectNumber', 'getAllObjectNames', 'reset', 'newConstruction'];
  log('Method khả dụng:', methods.filter((m) => typeof ggb[m] === 'function').join(', '));

  const before = ggb.getObjectNumber ? ggb.getObjectNumber() : '?';
  log('Số object trước test:', before);

  const cmds = ['A = (0, 0)', 'B = (4, 0)', 'C = (1, 3)', 'Polygon(A, B, C)'];
  const results = [];
  for (const c of cmds) {
    let ok = false;
    try {
      ok = ggb.evalCommand(c);
    } catch (e) {
      err('evalCommand ném lỗi tại:', c, e);
    }
    results.push({ command: c, ok });
    log(ok ? 'OK ' : 'FAIL', c, '->', ok);
    await new Promise((r) => setTimeout(r, 400));
  }

  const after = ggb.getObjectNumber ? ggb.getObjectNumber() : '?';
  log('Số object sau test:', after);

  const allOk = results.every((r) => r.ok === true);
  if (allOk) {
    log('%cKẾT LUẬN: §7.1 KHẢ THI ✅ — dùng ggbApplet.evalCommand làm hướng chính.', 'color:#0a0;font-size:14px');
  } else {
    err('KẾT LUẬN: evalCommand truy cập được nhưng vài lệnh trả false. Kiểm tra cú pháp / ngôn ngữ lệnh.');
  }
  console.table(results);
})();
