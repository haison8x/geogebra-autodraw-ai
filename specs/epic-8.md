# Epic 8 — Chế Độ Prompt: Flash (1 Bước) & Advanced (2 Bước) (P8)

> Nguồn: [README.md](../README.md) §18 · [epics.md](epics.md)
> Mục tiêu: Thêm **chế độ sinh prompt** cho user chọn — **Flash** (mặc định, 1 bước, như cũ) và **Advanced** (2 bước: đề toán → kế hoạch vẽ hình → lệnh GeoGebra). Chế độ được nhớ qua sessions.

---

## Bối Cảnh & Lý Do

Quy trình hiện tại (1 bước) đủ dùng cho bài toán đơn giản nhưng AI đôi khi mắc lỗi syntax GeoGebra hoặc lỗi hình học khi bài phức tạp hơn.

Chế độ **Advanced** tách hai nhiệm vụ để giảm lỗi:
- **Prompt 1** → AI tư duy hình học thuần túy: liệt kê đối tượng, thứ tự xây dựng, quan hệ phụ thuộc — **không** có lệnh GeoGebra.
- **Prompt 2** → AI dịch kế hoạch đó sang lệnh GeoGebra chính xác theo catalog cho phép.

Chế độ **Flash** giữ nguyên flow cũ (1 bước, nhanh hơn) làm mặc định.

---

## Tasks

### T8.1 — Chọn Chế Độ Prompt (UI)

- [ ] Thêm toggle/radio **chế độ sinh prompt** vào Popup, đặt gần nút Generate Prompt:
  - `Flash` (mặc định) — 1 bước
  - `Advanced` — 2 bước
- [ ] Toggle hiển thị inline, nhỏ gọn (radio hoặc segmented button), i18n.
- [ ] Switching mode thay đổi vùng UI bên dưới ngay lập tức (Flash UI ↔ Advanced UI).
- [ ] Persist lựa chọn `promptMode: 'flash' | 'advanced'` vào `settings` trong `StorageSchema` (§9); default `'flash'`.
- [ ] Khôi phục mode khi mở lại Popup.

### T8.2 — Flash Mode UI (Giữ Nguyên Flow Cũ)

Không thay đổi so với hiện tại. Khi mode = `'flash'`:

```
[1] Textarea: Đề bài
[2] Nút "Sinh Prompt"  →  copy vào clipboard  (buildPrompt hiện tại)
         ↓ (user dán sang AI ngoài, lấy lệnh GeoGebra)
[3] Textarea: Lệnh GeoGebra  (editable, sanitize on paste §10.1)
[4] Toggle chế độ vẽ
[5] Nút Thực thi  +  Nút Xóa hình
[6] Status
```

- [ ] Đảm bảo i18n key `copyPrompt` (đã có) vẫn dùng cho Flash mode.
- [ ] `buildPrompt(problem, catalog)` — hàm hiện tại, không đổi.

### T8.3 — Advanced Mode UI (2 Bước)

Khi mode = `'advanced'`:

```
[1] Textarea: Đề bài
[2] Nút "Sinh Prompt 1 (Kế Hoạch Vẽ)"  →  copy vào clipboard
         ↓ (user dán sang AI ngoài, lấy kế hoạch)
[3] Textarea: Kế hoạch vẽ hình  (editable, paste từ AI)
[4] Nút "Sinh Prompt 2 (Lệnh GeoGebra)"  →  copy vào clipboard
         ↓ (user dán sang AI ngoài, lấy lệnh GeoGebra)
[5] Textarea: Lệnh GeoGebra  (editable, sanitize on paste §10.1)
[6] Toggle chế độ vẽ
[7] Nút Thực thi  +  Nút Xóa hình
[8] Status
```

Chi tiết:
- [ ] Thêm state `interpretation: string` + `setInterpretation` vào `useAppState`.
- [ ] Thêm handler `handleCopyPrompt1()`: gọi `buildPrompt1(problem)` → copy vào clipboard.
  - Disable khi `problem.trim()` rỗng.
- [ ] Thêm handler `handleCopyPrompt2()`: gọi `buildPrompt2(interpretation, catalog)` → copy vào clipboard.
  - Disable khi `interpretation.trim()` rỗng hoặc catalog chưa load.
- [ ] Textarea **Kế hoạch vẽ hình**: rows=5, editable, placeholder i18n.
- [ ] `App.tsx`: render Flash UI hoặc Advanced UI tùy `promptMode` (conditional rendering).

### T8.4 — Prompt Templates

- [ ] **`buildPrompt1(problem: string): string`** — Prompt 1 cho Advanced mode:
  - Yêu cầu AI mô tả kế hoạch xây dựng hình học, **không** viết lệnh GeoGebra.
  - Chứa placeholder `{{PROBLEM}}`.
  - Nội dung (xem §18.1 README):
    - Liệt kê điểm tự do với tọa độ gợi ý (GENERAL POSITION RULES: tam giác scalene, A(-1,6) B(-3,0) C(7,0)).
    - Liệt kê đối tượng phụ thuộc theo thứ tự, ghi rõ đối tượng phụ trợ cần ẩn và label cần ẩn.
    - Chỉ vẽ đúng những gì đề bài yêu cầu — không thêm.
    - Đầu ra: danh sách bước, mỗi bước 1 dòng, không markdown, không lệnh GeoGebra.
- [ ] **`buildPrompt2(interpretation: string, commandsCatalog: string): string`** — Prompt 2 cho Advanced mode:
  - Chứa placeholder `{{INTERPRETATION}}` và `{{COMMANDS_CATALOG}}`.
  - Giữ nguyên toàn bộ rule set của `PROMPT_TEMPLATE` hiện tại (CONSTRAINTS, LITERAL CONSTRUCTION RULES, GENERAL POSITION RULES, CLEAN FIGURE RULES, CIRCLE RULES) — chỉ thay phần nhập liệu từ PROBLEM → CONSTRUCTION PLAN.
  - Preamble: "Translate the construction plan below into GeoGebra commands…"
- [ ] Đặt cả 3 hàm (`buildPrompt`, `buildPrompt1`, `buildPrompt2`) trong `src/shared/promptTemplate.ts`.

### T8.5 — Storage Schema

- [ ] Thêm `promptMode: 'flash' | 'advanced'` vào `settings` trong `StorageSchema` (§9). Default `'flash'`.
- [ ] Thêm `lastInterpretation: string` (chỉ dùng trong Advanced mode). Default `''`.
- [ ] Khôi phục `promptMode` và `lastInterpretation` khi mở lại Popup.

### T8.6 — Cập Nhật i18n (9 Locale)

- [ ] Thêm i18n keys mới vào tất cả 9 locale (`en` chuẩn + 8 bản dịch):
  - `promptModeLabel` — "Prompt Mode" / "Chế độ sinh prompt"
  - `promptModeFlash` — "Flash"
  - `promptModeAdvanced` — "Advanced"
  - `copyPrompt1` — "Generate Drawing Plan (Prompt 1)"
  - `copyPrompt2` — "Generate GeoGebra Commands (Prompt 2)"
  - `interpretationLabel` — "Drawing Plan (from AI)"
  - `interpretationPlaceholder` — "Paste AI's drawing plan here…"
- [ ] Parity test vẫn pass (mọi locale đủ key mới).

### T8.7 — Cập Nhật HelpPanel

- [ ] HelpPanel hiển thị hướng dẫn theo `promptMode` đang active, hoặc hiển thị cả 2 section rõ ràng.
- [ ] **Flash steps** (7 bước — giữ nguyên `helpStep1`…`helpStep7`):
  1. Nhập đề bài
  2. Chọn chế độ **Flash** (mặc định)
  3. Bấm **Sinh Prompt** → copy
  4. Dán vào AI ngoài → AI trả về lệnh GeoGebra
  5. Dán lệnh vào textarea **Lệnh GeoGebra**
  6. Chọn chế độ vẽ
  7. Bấm **Thực thi**
- [ ] **Advanced steps** (9 bước — i18n keys mới `helpAdvStep1`…`helpAdvStep9`):
  1. Nhập đề bài
  2. Chọn chế độ **Advanced**
  3. Bấm **Sinh Prompt 1** → copy
  4. Dán vào AI ngoài → AI trả về kế hoạch vẽ hình
  5. Dán kế hoạch vào textarea **Kế hoạch vẽ hình**
  6. Bấm **Sinh Prompt 2** → copy
  7. Dán vào AI ngoài → AI trả về lệnh GeoGebra
  8. Dán lệnh vào textarea **Lệnh GeoGebra**
  9. Bấm **Thực thi**
- [ ] Thêm mô tả ngắn sự khác biệt Flash vs Advanced (i18n key `helpModeCompare`):
  > Flash: nhanh, 1 lần hỏi AI. Advanced: 2 lần hỏi AI, kết quả chính xác hơn cho bài phức tạp.
- [ ] Thêm key `helpAdvStepTitle`, `helpFlashStepTitle` để phân biệt 2 section trong panel.

### T8.8 — Unit Tests

- [ ] Test `buildPrompt1(problem)`: chứa problem đã thay vào, không chứa `{{COMMANDS_CATALOG}}`, không chứa placeholder còn sót.
- [ ] Test `buildPrompt2(interpretation, catalog)`: chứa interpretation + catalog đã thay vào, không chứa placeholder còn sót.
- [ ] Test `buildPrompt` (Flash): không đổi so với hiện tại.
- [ ] Parity test locale: 9 locale đủ key mới (mở rộng test §T6.8 / §T7.5).

---

## DoD

- [ ] Toggle Flash/Advanced hiển thị trong Popup; lựa chọn được nhớ.
- [ ] Flash mode: flow hiện tại không thay đổi.
- [ ] Advanced mode: Prompt 1 copy 1 chạm từ đề bài; textarea kế hoạch editable; Prompt 2 copy 1 chạm từ kế hoạch + catalog; Prompt 2 disable khi kế hoạch rỗng.
- [ ] `lastInterpretation` khôi phục khi mở lại Popup ở Advanced mode.
- [ ] HelpPanel có hướng dẫn riêng cho Flash và Advanced.
- [ ] Toàn bộ chuỗi UI mới qua `t(key)` — không hardcode.
- [ ] Parity test 9 locale pass.
- [ ] Manual E2E Flash: đề → Prompt → AI → lệnh → Thực thi → hình vẽ đúng.
- [ ] Manual E2E Advanced: đề → Prompt 1 → AI → kế hoạch → Prompt 2 → AI → lệnh → Thực thi → hình vẽ đúng.
