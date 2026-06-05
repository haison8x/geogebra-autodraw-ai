# Epic 6 — Đa Ngôn Ngữ (i18n) (P6)

> Nguồn: [README.md](../README.md) §16 · [epics.md](epics.md)
> Mục tiêu: Popup hỗ trợ 9 ngôn ngữ, mặc định tiếng Anh, nhớ lựa chọn của user.

## Ngôn ngữ hỗ trợ

| Code | Ngôn ngữ | Tên bản địa |
|---|---|---|
| `en` | English (mặc định) | English |
| `vi` | Tiếng Việt | Tiếng Việt |
| `zh-CN` | Trung giản thể | 简体中文 |
| `es` | Tây Ban Nha | Español |
| `pt` | Bồ Đào Nha | Português |
| `fr` | Pháp | Français |
| `de` | Đức | Deutsch |
| `ja` | Nhật | 日本語 |
| `ko` | Hàn | 한국어 |

---

## Tasks

### T6.1 — Hạ tầng i18n (`src/shared/i18n/`)
- [x] Type `Locale = 'en' | 'vi' | 'zh-CN' | 'es' | 'pt' | 'fr' | 'de' | 'ja' | 'ko'`.
- [x] Type `Messages` (tập key UI), lấy `en` làm chuẩn key.
- [x] Hàm `t(locale, key, vars?)` → tra dict locale, thiếu key → fallback `en`, thiếu cả `en` → trả key.
- [x] Hỗ trợ nội suy biến đơn giản (vd `{index}`, `{total}`).

### T6.2 — File locale (9 ngôn ngữ)
- [x] `en.ts` (chuẩn, đầy đủ key) + 8 file dịch: `vi`, `zh-CN`, `es`, `pt`, `fr`, `de`, `ja`, `ko`.
- [x] Key bao phủ mọi chuỗi UI: tiêu đề, label đề bài, nút Sinh Prompt/Copy/Thực thi/Xóa hình, chế độ vẽ, trạng thái (đang chạy/hoàn tất/reload), lỗi, lịch sử, placeholder.

### T6.3 — Phát hiện ngôn ngữ ban đầu
- [x] `detectLocale()`: đọc `chrome.i18n.getUILanguage()` → chuẩn hóa (vd `zh-CN`, `zh` → `zh-CN`; `en-US` → `en`) → map về locale hỗ trợ.
- [x] Không khớp → `en`.
- [x] Ưu tiên `settings.locale` đã lưu nếu có; không thì dùng `detectLocale()`.

### T6.4 — Selector ngôn ngữ + lưu
- [x] Dropdown/select ngôn ngữ trong Popup (hiện tên bản địa).
- [x] Đổi → cập nhật UI ngay (state) + lưu `settings.locale` vào `chrome.storage.local` (§9).
- [x] Mở lại Popup → khôi phục locale đã chọn.

### T6.5 — Localize UI Popup
- [x] Thay mọi chuỗi hardcode trong `App.tsx`/`StatusPanel` bằng `t(locale, key, …)`.
- [x] Không còn chuỗi tiếng Anh cứng trong JSX (trừ tên sản phẩm "GeoGebra AutoDraw AI").

### T6.6 — Prompt theo locale (command names giữ tiếng Anh)
- [x] **Bất biến (ĐÃ đảm bảo):** ràng buộc "Command names MUST be in English" + ví dụ `Polygon/Segment/Midpoint` luôn giữ — không dịch (§13.3).

### T6.7 — Storage
- [x] Mở rộng `settings` (§9): thêm `locale: Locale`. Default = `detectLocale()` lần đầu.
- [x] Cập nhật `StorageSchema` + `DEFAULTS`.

### T6.8 — Unit test
- [x] `t()` fallback về `en` khi thiếu key; trả key khi thiếu cả `en`; nội suy biến đúng.
- [x] `detectLocale()` map đúng (`zh-CN`/`zh`→`zh-CN`, `en-GB`→`en`, lạ→`en`).
- [x] **Parity test:** mọi locale có đúng tập key như `en` (không thiếu, không thừa).

---

## DoD
- Đổi ngôn ngữ → UI cập nhật ngay; mặc định English.
- Nhớ lựa chọn ngôn ngữ khi mở lại Popup.
- 9 locale đủ key (parity test pass).
- Command names trong prompt luôn tiếng Anh bất kể locale.
