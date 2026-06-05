# Spike P3 — Test content script `world:"MAIN"` thấy `ggbApplet`

Mục đích: xác nhận content script (không phải console) truy cập được `window.ggbApplet`.

**Kết quả (2026-06-05): PASS** — thấy `ggbApplet` sau 2 lần poll, `evalCommand` + `reset()` chạy.

## Chạy

1. Chrome → mở `chrome://extensions`
2. Bật **Developer mode** (toggle góc trên phải)
3. **Load unpacked** → chọn folder `specs/spike-p3-world` này
4. Mở tab `https://www.geogebra.org/calculator`, chờ thấy lưới tọa độ
5. F12 → tab **Console** của trang GeoGebra → đọc log `[CS]`

## Kỳ vọng

- `[CS] ggbApplet THAY DUOC ...` + điểm A vẽ ra → ✅ §7.1 chốt, hết rủi ro.
- `[CS] TIMEOUT ❌` → applet không ở MAIN window (iframe/shadow DOM), cần chiến lược khác.

## Test đối chứng (chứng minh world là nguyên nhân)

Sửa [manifest.json](manifest.json): xóa dòng `"world": "MAIN"` → Reload extension → mở lại tab GeoGebra.
Kỳ vọng: TIMEOUT ❌ (content script về ISOLATED world, không thấy biến page).

## Lưu ý

- Sau mỗi lần sửa file → bấm **Reload** extension ở chrome://extensions, rồi **F5** tab GeoGebra.
- Log nằm ở console TAB GeoGebra, không phải console của extension.
- Bước tiếp (P3): xác nhận `chrome.runtime.sendMessage` còn dùng được ở MAIN world — quyết định kiến trúc message passing (README §7.2).
