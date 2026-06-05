# E2E QA Checklist — spec §12 (manual)

> Tự động hóa được: unit test (Vitest, 20 pass), typecheck, build. Phần dưới cần Chrome thật
> + AI ngoài → chạy tay. Load: `chrome://extensions` → Developer mode → Load unpacked → `dist/`.

## User journey (§4.1)
- [ ] Nhập đề bài → **Sinh Prompt** → prompt chứa đề + danh mục lệnh.
- [ ] **Copy prompt** 1 chạm → dán sang AI (Gemini/ChatGPT/Claude).
- [ ] Dán lệnh AI (có ```` ``` ````/đánh số) vào textarea → tự sanitize thành list sạch.
- [ ] Sửa lệnh trong textarea editable trước khi vẽ.
- [ ] **Xóa trắng vẽ lại** (mặc định): bấm Thực thi → tab GeoGebra mở → `reset()` → hình vẽ tuần tự.
- [ ] **Vẽ tiếp**: lệnh thêm vào hình hiện có, không `reset()`.
- [ ] Popup hiện tiến độ `x/n` + báo **Hoàn tất**.
- [ ] **Xóa hình**: bấm → canvas reset.

## Edge cases (§10)
- [ ] Lệnh sai cú pháp → liệt kê lỗi, **không** dừng batch.
- [ ] Reload tab GeoGebra giữa chừng → Popup báo "tab reload, chạy lại".
- [ ] Textarea lệnh rỗng → nút Thực thi disabled.
- [ ] Đóng/mở lại Popup → đề bài + lệnh gần nhất khôi phục; chế độ vẽ nhớ.
- [ ] Mở nhiều tab GeoGebra → chỉ tab mục tiêu bị thao tác.
- [ ] `ggbApplet` chưa load 15s → báo "GeoGebra chưa sẵn sàng, thử lại".

## Rủi ro P3 cần xác nhận trên Chrome thật (§7.2, T3.6)
- [ ] Kiến trúc 2 lớp chạy: content ISOLATED relay được chrome.runtime; MAIN world chạy `evalCommand`; 2 lớp nói chuyện qua `window.postMessage`.
