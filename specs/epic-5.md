# Epic 5 — QA E2E, Polish, Đóng Gói (P5)

> Nguồn: [README.md](../README.md) §4.1, §12, §15 · [epics.md](epics.md)
> Mục tiêu: Sản phẩm nghiệm thu được, đóng gói release.

---

## Tasks

### T5.1 — Manual E2E full user journey (§4.1)
- [ ] Nhập đề bài → Sinh Prompt → copy.
- [ ] Paste sang AI ngoài → nhận lệnh → paste vào Popup → sanitize.
- [ ] Thực thi → tab GeoGebra mở → hình vẽ tự động.
- [ ] Test cả 2 chế độ: Xóa trắng vẽ lại + Vẽ tiếp.

### T5.2 — Chạy hết checklist Acceptance Criteria (§12)
- [ ] Sinh Prompt copy 1 chạm.
- [ ] Prompt yêu cầu lệnh tiếng Anh.
- [ ] Sanitize input markdown/đánh số.
- [ ] Toggle chế độ vẽ + nhớ lựa chọn.
- [ ] Thực thi `reset()` + chạy tuần tự + delay.
- [ ] Tiến độ x/n + Hoàn tất.
- [ ] Lệnh lỗi không dừng batch.
- [ ] Khôi phục đề/lệnh gần nhất.
- [ ] Không crash khi tab reload / context invalidated.

### T5.3 — Polish UI Popup
- [x] Trạng thái thực thi rõ ràng (đang chạy / lỗi / hoàn tất) — `StatusPanel`.
- [x] Loading state, disable nút khi đang chạy (`phase === 'running'`).
- [x] Hiển thị danh sách lỗi + lịch sử.

### T5.4 — Đóng gói release (§15)
- [x] `pnpm build` production sạch (prebuild sinh min.json).
- [x] Zip `dist/` → `geogebra-autodraw-ai-v1.0.0.zip`.
- [x] Hướng dẫn load unpacked: [e2e-checklist.md](e2e-checklist.md) + README §15.

---

## DoD
- Build production sạch ✅, `pnpm typecheck` pass ✅, 20 unit test pass ✅.
- Package release sẵn sàng ✅ (`geogebra-autodraw-ai-v1.0.0.zip`).
- **Còn lại — manual trên Chrome thật** (T5.1, T5.2): chạy [e2e-checklist.md](e2e-checklist.md). Không tự động hóa được trong môi trường headless.
