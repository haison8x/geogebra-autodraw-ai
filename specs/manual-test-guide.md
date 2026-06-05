# Hướng Dẫn Test Thủ Công — GeoGebra AutoDraw AI

> Dành cho QA / Dev. Test extension trên Chrome thật (Developer mode). Bổ trợ cho [e2e-checklist.md](e2e-checklist.md).
> Yêu cầu: Chrome (hoặc Edge/Brave Chromium), Node + pnpm, 1 AI ngoài (Gemini/ChatGPT/Claude).

---

## 1. Build extension

```bash
pnpm install        # lần đầu
pnpm build          # sinh thư mục dist/ (đã chạy prebuild → geometry_commands.min.json)
```

- Build xong → có thư mục `dist/` ở gốc dự án (`c:\mmo\geogebra\dist`).
- Muốn vừa code vừa test (auto rebuild): `pnpm dev` thay cho `pnpm build`.

---

## 2. Cài đặt ở Developer mode

1. Mở Chrome → gõ địa chỉ: `chrome://extensions`
2. Bật công tắc **Developer mode** (góc trên bên phải).
3. Bấm **Load unpacked** (Tải tiện ích đã giải nén).
4. Chọn thư mục **`dist/`** (KHÔNG chọn thư mục gốc dự án).
5. Extension **GeoGebra AutoDraw AI** xuất hiện trong danh sách → ghim icon ra thanh công cụ (bấm icon hình ghép → ghim).

> **Sau khi sửa code + rebuild:** quay lại `chrome://extensions` → bấm nút **↻ (Reload)** trên thẻ extension. Nếu dùng `pnpm dev` thì thường tự reload (HMR) — nhưng đổi manifest/content script vẫn nên reload tay.

### Lỗi cài đặt thường gặp
| Lỗi | Cách xử lý |
|---|---|
| "Manifest file is missing or unreadable" | Chọn nhầm thư mục. Phải chọn `dist/`, không phải gốc dự án. |
| Extension xám / lỗi đỏ | Bấm **Errors** trên thẻ để xem log. Thường do build lỗi → chạy lại `pnpm build`. |
| Không thấy icon | Bấm icon hình ghép trên thanh công cụ → ghim "GeoGebra AutoDraw AI". |

---

## 3. Mở DevTools để xem log (khi debug)

- **Popup:** chuột phải vào popup → **Inspect**.
- **Background (service worker):** `chrome://extensions` → thẻ extension → bấm **service worker** (link xanh).
- **Content script:** mở DevTools (F12) ngay trên tab `geogebra.org/calculator` → tab Console.

---

## 4. Luồng test chính (happy path)

1. Bấm icon extension → popup mở.
2. **Đề bài:** nhập, ví dụ:
   ```
   Cho tam giác ABC với A(0,0), B(4,0), C(1,3). Vẽ tam giác và trung điểm M của BC.
   ```
3. Bấm **Sinh Prompt** → khung prompt hiện ra (chứa đề + danh mục lệnh).
4. Bấm **Copy prompt** → thấy đổi thành "✓ Đã copy".
5. Dán prompt sang AI ngoài → AI trả về danh sách lệnh GeoGebra.
   > 💡 **Khuyên dùng:** **Gemini**, **Claude**, hoặc **ChatGPT** cho kết quả tốt hơn (lệnh chính xác, ít lỗi cú pháp). Các AI yếu hơn dễ trả lệnh sai/không hợp lệ.
6. Copy lệnh AI → dán vào ô **Danh sách lệnh** trong popup.
   - Kể cả AI trả kèm ```` ```geogebra ````, đánh số "1. ", bullet "- " → popup **tự làm sạch**.
   - Ô lệnh **sửa được** → chỉnh trước khi vẽ nếu cần.
7. Chọn chế độ vẽ: **Xóa trắng vẽ lại** (mặc định) hoặc **Vẽ tiếp**.
8. Bấm **Thực thi (Vẽ)**.
9. Tab `geogebra.org/calculator` mở → hình vẽ tự động từng lệnh.
10. Popup hiện **Đang chạy x/n** → kết thúc **✓ Hoàn tất N lệnh**.

**Lệnh mẫu để test nhanh (khỏi cần AI):** dán thẳng vào ô lệnh:
```
A=(0,0)
B=(4,0)
C=(1,3)
Polygon(A,B,C)
M=Midpoint(B,C)
Segment(A,M)
```

---

## 5. Test theo tính năng

### 5.1. Sinh prompt + copy
- [ ] Đề rỗng → nút **Sinh Prompt** bị disable.
- [ ] Có đề → Sinh Prompt → prompt chứa đúng đề bài + danh mục lệnh.
- [ ] Prompt có ràng buộc "Command names MUST be in English".
- [ ] Copy 1 chạm hoạt động.

### 5.2. Sanitize lệnh
Dán thử input "bẩn":
```
```geogebra
1. A=(0,0)
2. B=(4,0)
- Polygon(A,B,C)
```
```
- [ ] Kết quả còn lại 3 dòng sạch: `A=(0,0)`, `B=(4,0)`, `Polygon(A,B,C)` (mất fence, mất số/bullet).
- [ ] Bấm **Làm sạch lại** → làm sạch ô lệnh hiện tại.

### 5.3. Chế độ vẽ
- [ ] **Xóa trắng vẽ lại**: vẽ lần 2 → hình cũ bị xóa (`reset()`), chỉ còn hình mới.
- [ ] **Vẽ tiếp**: vẽ lần 2 → hình mới thêm vào hình cũ.
- [ ] Chọn chế độ → đóng/mở lại popup → chế độ được **nhớ**.

### 5.4. Tiến độ + lỗi
- [ ] Popup hiện "Đang chạy x/n" khi vẽ.
- [ ] Lệnh sai cú pháp (vd `Polygon(A,B)` thiếu điểm, hoặc `XYZ(1,2)`) → **không dừng** cả batch, lệnh còn lại vẫn chạy.
- [ ] Lệnh lỗi được liệt kê trong kết quả (dòng x: lệnh — message).

### 5.5. Nút Xóa hình
- [ ] Bấm **Xóa hình** → canvas GeoGebra reset trắng.

### 5.6. Lưu trạng thái / lịch sử
- [ ] Nhập đề + lệnh → đóng popup → mở lại → đề bài + lệnh **khôi phục**.
- [ ] Sau mỗi lần Thực thi → mục mới vào **Lịch sử**; bấm 1 mục → nạp lại đề + lệnh.
- [ ] Vẽ > 20 lần → lịch sử giữ tối đa 20 mục (mục cũ nhất bị bỏ).

### 5.7. Đa ngôn ngữ (i18n) — Epic 6
- [ ] Selector ngôn ngữ ở góc trên popup, hiện tên bản địa (English, Tiếng Việt, 简体中文, Español, Português, Français, Deutsch, 日本語, 한국어).
- [ ] Đổi ngôn ngữ → **toàn bộ chữ UI đổi ngay** (label, nút, trạng thái).
- [ ] Đóng/mở lại popup → ngôn ngữ đã chọn được **nhớ**.
- [ ] Lần cài đầu (chưa chọn gì): UI theo ngôn ngữ trình duyệt nếu được hỗ trợ, nếu không → English.
- [ ] Đổi sang ngôn ngữ khác → **Sinh Prompt** → prompt vẫn yêu cầu **command names tiếng Anh** (không bị dịch tên lệnh).

### 5.8. Edge cases
- [ ] **Reload tab GeoGebra** giữa lúc đang vẽ → popup báo "Tab GeoGebra đã reload — bấm Thực thi lại".
- [ ] Đóng tab GeoGebra rồi Thực thi lại → extension tự mở tab mới.
- [ ] Mở **nhiều tab** GeoGebra → extension chỉ vẽ vào đúng tab nó tạo.
- [ ] Reload extension (`chrome://extensions` → ↻) trong lúc tab mở → không crash (log "context invalidated" bị bỏ qua, không lỗi đỏ).
- [ ] Ô lệnh rỗng → nút **Thực thi** disable.

---

## 6. Kiểm tra tự động (chạy trước khi test tay)

```bash
pnpm typecheck      # type pass
pnpm test           # unit test (Vitest) — sanitize, prompt, minify, storage, i18n
```
- [ ] Typecheck pass, không lỗi.
- [ ] Toàn bộ unit test pass (gồm parity 9 locale).

---

## 7. Đóng gói release (khi nghiệm thu xong)

```bash
pnpm build
```
Zip thư mục `dist/` (Windows PowerShell):
```powershell
Compress-Archive -Path dist\* -DestinationPath geogebra-autodraw-ai-v1.0.0.zip
```
File zip dùng để chia sẻ / nộp lên Chrome Web Store.

---

## 8. Báo lỗi
Khi gặp lỗi, ghi lại:
1. Bước tái hiện (đề bài + lệnh đã dùng).
2. Ngôn ngữ UI đang chọn.
3. Log Console của: Popup / Background / Content (mục §3).
4. Ảnh chụp màn hình popup + tab GeoGebra.
