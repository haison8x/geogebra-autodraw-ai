# Epic 3 — Background + Content Script + Thực Thi evalCommand (P3)

> Nguồn: [README.md](../README.md) §3.2, §3.3, §4.2, §7 · [epics.md](epics.md)
> Mục tiêu: Pipeline thực thi end-to-end: Popup → Background → Content → `ggbApplet`.

---

## Tasks

### T3.1 — Background nghe `EXECUTE_COMMANDS` (§3.2)
- [x] `chrome.runtime.onMessage` lọc action `EXECUTE_COMMANDS { commands, clearFirst }`.
- [x] Mở tab GeoGebra `chrome.tabs.create({ url: GEOGEBRA_URL })`.
- [x] Lưu `targetTabId` (chỉ thao tác đúng tab — liên kết Epic 4 nhiều tab).

### T3.2 — Chờ tab complete → gửi `RUN_COMMANDS`
- [x] `chrome.tabs.onUpdated` chờ `status === 'complete'` đúng `targetTabId`.
- [x] Gửi `RUN_COMMANDS { commands, delayMs, clearFirst }` xuống Content Script.

### T3.3 — Content script poll `ggbApplet` (§7.1)
- [x] Content script `world:"MAIN"`.
- [x] Poll chờ `window.ggbApplet` (hoặc `ggbAppletOnLoad`) sẵn sàng.
- [x] Gửi `CONTENT_READY` khi sẵn sàng.

### T3.4 — Loop thực thi `evalCommand` (§7.1)
- [x] Nếu `clearFirst` → `ggbApplet.reset()` trước.
- [x] Loop: `evalCommand(cmd)` từng dòng + `delay(delayMs)`.
- [x] `evalCommand` trả `false` → gửi `COMMAND_ERROR`, **không dừng** batch.

### T3.5 — Relay tiến độ
- [x] Content gửi `PROGRESS { index, total, command }` → Background → Popup.
- [x] Popup hiển thị "đang chạy x/n".
- [x] Cuối batch: `DONE { ok, executed, errors[] }` → Popup báo Hoàn tất + liệt kê lỗi.

### T3.6 — Verify rủi ro MAIN world (từ Epic 0 T0.4)
- [x] Kiểm `chrome.runtime.sendMessage` có chạy ở `world:"MAIN"` không.
- [x] **Nếu hạn chế** → refactor kiến trúc 2 lớp:
  - Content ISOLATED: lo message passing với Background.
  - Inject đoạn MAIN: lo `evalCommand`.
  - 2 lớp nói chuyện qua `window.postMessage` (§7.2).

---

## DoD (AC §12)
- Bấm Thực thi → tab GeoGebra mở; nếu Xóa trắng thì `reset()` trước.
- Lệnh chạy tuần tự qua `evalCommand`, mỗi dòng có delay; hình vẽ ra.
- Popup hiển thị tiến độ x/n + báo Hoàn tất.
- Lệnh lỗi không dừng batch; liệt kê trong kết quả.
