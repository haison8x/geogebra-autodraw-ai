# Epic 7 — Hướng Dẫn Sử Dụng + Nút Hướng Dẫn (P7)

> Nguồn: [README.md](../README.md) §17 · [epics.md](epics.md)
> Mục tiêu: Người dùng mới hiểu cách dùng extension ngay trong Popup, qua nút **Hướng dẫn**; nội dung đa ngôn ngữ (tái dùng hạ tầng i18n Epic 6).

---

## Tasks

### T7.1 — Nút Hướng dẫn trong Popup
- [x] Thêm nút **Hướng dẫn (Help)** (icon `❓` hoặc text), đặt cạnh selector ngôn ngữ ở header Popup.
- [x] Bấm → mở panel/modal hướng dẫn (overlay hoặc section bung ra). Có nút Đóng.
- [x] Không chặn thao tác chính khi đóng.

### T7.2 — Nội dung hướng dẫn theo bước
- [x] Liệt kê các bước: (1) nhập đề bài → (2) bấm Sinh Prompt → (3) Copy prompt → (4) dán sang AI ngoài → (5) dán danh sách lệnh AI trả về → (6) chọn chế độ vẽ → (7) bấm Thực thi.
- [x] Mẹo hình sạch: ưu tiên Segment, ẩn label/đường phụ (§6.3); lệnh tên tiếng Anh.
- [x] Ghi chú: lần đầu cần cài Developer mode (trỏ [manual-test-guide.md](manual-test-guide.md)).

### T7.3 — Link ngoài
- [x] Link GeoGebra Calculator: `https://www.geogebra.org/calculator`.
- [x] (Tùy chọn) link AI gợi ý (Gemini/ChatGPT/Claude).

### T7.4 — Đa ngôn ngữ
- [x] Mọi chuỗi hướng dẫn lấy qua `t(locale, key)` (Epic 6) — KHÔNG hardcode.
- [x] Bổ sung key hướng dẫn vào cả 9 file locale (`en` chuẩn + 8 bản dịch).
- [x] Đổi ngôn ngữ → nội dung hướng dẫn đổi ngay.

### T7.5 — Test
- [x] Parity test (mở rộng §T6.8): key hướng dẫn mới có đủ ở 9 locale (38 test pass).
- [ ] (Tùy chọn, CHƯA làm) render test panel mở/đóng — chưa setup RTL/jsdom; verify thủ công.

---

## DoD
- Bấm **Hướng dẫn** → panel mở, nội dung từng bước rõ ràng.
- Đổi ngôn ngữ → hướng dẫn đổi theo (9 locale đủ key).
- Đóng được panel, quay lại UI chính.
- Không hardcode chuỗi; parity test pass.
