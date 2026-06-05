# Epic 4 — Edge Cases, Storage/History, Nút Xóa Hình (P4)

> Nguồn: [README.md](../README.md) §9, §10, §13.4 · [epics.md](epics.md)
> Mục tiêu: Bền với lỗi runtime; nhớ trạng thái; quản lịch sử.

---

## Tasks

### T4.1 — Storage schema (`chrome.storage.local`) (§9)
- [x] Type `StorageSchema`: `lastProblem`, `lastCommandsRaw`, `settings`, `history`.
- [x] `settings.delayMs` mặc định `600`; `settings.clearFirstDefault` mặc định `true`.
- [x] Helper get/set typed wrap `chrome.storage.local`.

### T4.2 — Khôi phục trạng thái
- [x] Mở Popup → load `lastProblem` + `lastCommandsRaw` vào form.
- [x] Lưu lại mỗi khi user sửa (debounce).

### T4.3 — Nhớ chế độ vẽ
- [x] Toggle Xóa trắng/Vẽ tiếp đọc + ghi `clearFirstDefault`.

### T4.4 — History ≤ 20 mục, FIFO (§9)
- [x] Mỗi lần Thực thi → push `{ id: timestamp, problem, commands[] }`.
- [x] Vượt 20 → xóa mục cũ nhất (FIFO).
- [x] Bắt `QUOTA_BYTES` error → FIFO xóa history cũ (§10).

### T4.5 — Nút Xóa hình (§13.4)
- [x] Nút riêng → gửi lệnh `reset()` xuống Content Script.

### T4.6 — Edge cases (§10)
- [x] **Tab reload giữa chừng:** Content gửi lại `CONTENT_READY`; Background dừng batch, báo Popup "tab reload, chạy lại".
- [x] **`Extension context invalidated`:** bọc mọi `chrome.runtime.sendMessage` trong try-catch; log + bỏ qua.
- [x] **`ggbApplet` chưa load:** poll tối đa 15s (interval 300ms); timeout → `DONE {ok:false}` + báo "GeoGebra chưa sẵn sàng, thử lại".
- [x] **Content không thấy `ggbApplet`:** assert sai world → đảm bảo `world:"MAIN"`.
- [x] **Nhiều tab GeoGebra:** chỉ thao tác `targetTabId` đã tạo.

---

## DoD (AC §12)
- Đề bài/lệnh gần nhất khôi phục khi mở lại Popup.
- Chế độ vẽ nhớ lần sau.
- History giới hạn 20, FIFO khi vượt.
- Không crash khi tab reload / context invalidated.
