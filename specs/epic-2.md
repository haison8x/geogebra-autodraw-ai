# Epic 2 — Popup UI + Sinh Prompt + Sanitize (P2)

> Nguồn: [README.md](../README.md) §3.1, §6, §10.1 · [epics.md](epics.md)
> Mục tiêu: UI nhập đề → sinh prompt copy 1 chạm → paste lệnh AI → sanitize → preview editable.

---

## Tasks

### T2.1 — Build-time: `geometry_commands.min.json` (§6.2)
- [x] Script đọc `geometry_commands.json` gốc.
- [x] Lọc lệnh **hình phẳng 2D** (loại 3D/thống kê không liên quan).
- [x] Rút gọn mỗi lệnh: `name` + 1 dòng `syntax` chính + `description` ngắn.
- [x] Output `public/geometry_commands.min.json`.
- [x] Unit test: kích thước giảm rõ, không sót field bắt buộc.

### T2.2 — Template prompt (`src/shared/promptTemplate.ts`) (§6.3)
- [x] Hằng template với placeholder `{{PROBLEM}}` + `{{COMMANDS_CATALOG}}`.
- [x] Hàm `buildPrompt(problem, catalog)` ghép template.
- [x] Unit test: thay đúng placeholder; yêu cầu lệnh tên tiếng Anh có trong output.

### T2.3 — Sanitize lệnh (`src/shared/sanitize.ts`) (§10.1)
- [x] Tách theo `\n`.
- [x] Bỏ fence ```` ```geogebra ```` / ```` ``` ````.
- [x] Regex bỏ tiền tố `"1. "`, `"- "`, `"* "` đầu dòng.
- [x] `trim()` từng dòng, loại dòng rỗng.
- [x] Unit test (TDD): input markdown/đánh số → list lệnh sạch.

### T2.4 — Form nhập Đề bài (§3.1)
- [x] Textarea đề bài, controlled state.
- [x] Khôi phục `lastProblem` từ storage (liên kết Epic 4).

### T2.5 — Nút Sinh Prompt + Copy
- [x] Bấm → `buildPrompt(problem, minCatalog)` → hiển thị prompt.
- [x] Nút Copy 1 chạm (clipboard API).

### T2.6 — Textarea lệnh + preview editable
- [x] Paste lệnh AI → auto sanitize (T2.3).
- [x] Hiển thị kết quả ở textarea **editable** → user sửa trước khi vẽ.

### T2.7 — Toggle chế độ vẽ
- [x] Radio/toggle: **Xóa trắng vẽ lại** (mặc định) | **Vẽ tiếp** → set `clearFirst`.

### T2.8 — Validate
- [x] Disable nút Thực thi khi textarea lệnh rỗng (§10).

---

## DoD (AC §12)
- Nhập đề → Sinh Prompt → prompt chứa đề + danh mục lệnh, copy 1 chạm.
- Prompt yêu cầu AI trả lệnh tên tiếng Anh.
- Paste lệnh (kể cả markdown/đánh số) → sanitize đúng → textarea sửa được.
- Có toggle Xóa trắng vẽ lại (mặc định) / Vẽ tiếp.
- Unit test sanitize + prompt pass.
