# Epic 0 — Spike & Khả Thi API (P0) ✅ DONE

> Nguồn: [README.md](../README.md) §7, §13.1 · [epics.md](epics.md)
> Mục tiêu: Xác nhận `ggbApplet.evalCommand` chạy được trên GeoGebra Calculator trước khi build.

---

## Tasks

### T0.1 — Spike console `/calculator` ✅
- [x] Mở `https://www.geogebra.org/calculator`, console tab.
- [x] Gọi `window.ggbApplet.evalCommand('A=(0,0)')` → kiểm tra trả `true`.
- [x] Vẽ tam giác ABC bằng 4 lệnh → tất cả `true`.
- **Artifact:** [spike-7.1-ggbApplet.js](spike-7.1-ggbApplet.js)

### T0.2 — Spike content script `world:"MAIN"` ✅
- [x] Load unpacked extension test với content script `world:"MAIN"`.
- [x] Poll `window.ggbApplet` → thấy sau 2 lần poll.
- [x] `evalCommand('A=(0,0)')` → `true`; `reset()` khả dụng.
- **Artifact:** [spike-p3-world/](spike-p3-world/)

### T0.3 — Liệt kê method khả dụng ✅
- [x] Xác nhận: `evalCommand`, `reset`, `newConstruction`, `deleteObject`, `getAllObjectNames`, `setCoordSystem`.
- [x] `evalCommand` trả `boolean` → dùng làm tín hiệu lỗi từng lệnh.

### T0.4 — Ghi nhận rủi ro mở
- [x] **Verify ở Epic 3:** `chrome.runtime.sendMessage` có gọi được ở MAIN world không. Nếu hạn chế → kiến trúc 2 lớp ISOLATED + inject MAIN qua `window.postMessage`.
  - **Chốt (Epic 3):** dùng 2 lớp — [src/content/index.ts](../src/content/index.ts) (ISOLATED) ⇄ [src/content/main-world.ts](../src/content/main-world.ts) (MAIN) qua [bridge.ts](../src/shared/bridge.ts).

---

## DoD
- Spike artifacts trong [specs/](.).
- Quyết định kiến trúc MAIN world chốt (§13.1).
- `evalCommand` xác nhận thực thi DUY NHẤT (không giả lập gõ phím / DOM).
