# Hướng Dẫn Đóng Gói & Phát Hành lên Chrome Web Store

> Cho extension **GeoGebra AutoDraw AI**. Đọc kèm [manual-test-guide.md](manual-test-guide.md) (test) và [README.md](../README.md) (spec).

---

## 1. Chuẩn bị trước khi đóng gói

- [ ] Test thủ công đầy đủ ([manual-test-guide.md](manual-test-guide.md)) — happy path + edge case.
- [ ] `pnpm typecheck` pass.
- [ ] `pnpm lint` pass.
- [ ] `pnpm test` pass (unit + parity 9 locale).
- [ ] Tăng `version` trong [package.json](../package.json) (manifest lấy từ đây). Quy tắc: SemVer `major.minor.patch`, vd `1.0.0` → `1.0.1`. **Mỗi lần upload phải tăng version**, không trùng bản đã có trên store.

---

## 2. Đóng gói (build + zip)

```bash
pnpm install        # nếu máy mới
pnpm build          # prebuild sinh geometry_commands.min.json + build dist/
```

Zip **nội dung bên trong** `dist/` (KHÔNG zip cả thư mục `dist` bọc ngoài — manifest.json phải nằm ở gốc file zip):

**PowerShell (Windows):**
```powershell
$v = (Get-Content package.json | ConvertFrom-Json).version
Compress-Archive -Path dist\* -DestinationPath "geogebra-autodraw-ai-v$v.zip" -Force
```

**Kiểm tra zip đúng cấu trúc** — `manifest.json` ở gốc:
```
geogebra-autodraw-ai-v1.0.0.zip
├─ manifest.json          ← phải ở gốc
├─ service-worker-loader.js
├─ icons/
├─ assets/
├─ geometry_commands.min.json
└─ src/popup/index.html
```

> ⚠️ Lỗi hay gặp: zip cả folder `dist/` → store báo "Manifest file is missing". Phải zip `dist\*` (các file bên trong).

---

## 3. Tài khoản Chrome Web Store Developer

- [ ] Tài khoản Google.
- [ ] Đăng ký Developer: https://chrome.google.com/webstore/devconsole — **phí một lần US$5** (trả qua thẻ).
- [ ] Hoàn tất thông tin tài khoản (tên publisher, email liên hệ — xác minh email).

---

## 4. Tài nguyên store cần chuẩn bị

| Mục | Yêu cầu |
|---|---|
| **Icon store** | 128×128 PNG ([public/icons/icon128.png](../public/icons/icon128.png) đã có) |
| **Screenshot** | Tối thiểu 1, kích thước **1280×800** hoặc 640×400 PNG/JPG. Nên chụp side panel đang vẽ hình trên GeoGebra |
| **Tile nhỏ (tùy chọn)** | 440×280 promo tile |
| **Tên** | "GeoGebra AutoDraw AI" (≤ 75 ký tự) |
| **Mô tả ngắn** | ≤ 132 ký tự |
| **Mô tả chi tiết** | Công dụng, cách dùng (xem mẫu §6) |
| **Danh mục** | Education / Productivity |
| **Ngôn ngữ** | Mặc định English (UI hỗ trợ 9 ngôn ngữ) |

---

## 5. Quyền riêng tư (bắt buộc khai báo)

Chrome Web Store yêu cầu khai báo mục đích từng permission + chính sách dữ liệu:

| Permission | Lý do khai báo |
|---|---|
| `tabs` | Mở/theo dõi tab GeoGebra Calculator để vẽ hình |
| `storage` | Lưu cục bộ đề bài/lệnh/lịch sử + ngôn ngữ (không gửi đi đâu) |
| `sidePanel` | Hiển thị giao diện ở side panel |
| `host_permissions: https://www.geogebra.org/*` | Chạy content script trên trang GeoGebra để gọi `ggbApplet` |

- [ ] **Data usage:** extension **không thu thập, không gửi** dữ liệu người dùng ra ngoài (tất cả lưu `chrome.storage.local`). Khai: "Does not collect user data".
- [ ] **Privacy policy:** nếu khai không thu thập dữ liệu thì thường không bắt buộc URL; nếu store yêu cầu, viết 1 trang nêu rõ "không thu thập".
- [ ] Lý do dùng host permission + remote code: extension **không** dùng remote code (mọi JS đóng gói sẵn) → khai "No".

---

## 6. Mẫu mô tả store

**Mô tả ngắn (≤132):**
```
Vẽ hình học phẳng tự động trên GeoGebra: sinh prompt cho AI, dán lệnh, vẽ 1 chạm.
```

**Mô tả chi tiết:**
```
GeoGebra AutoDraw AI là cầu nối giữa AI (Gemini/Claude/ChatGPT) và GeoGebra Calculator.

Cách dùng:
1. Nhập đề bài hình học.
2. Bấm "Sinh Prompt" → Copy.
3. Dán sang AI, lấy danh sách lệnh GeoGebra.
4. Dán lệnh vào extension → bấm Vẽ.
5. Hình được vẽ tự động trên GeoGebra Calculator.

Tính năng:
- Giao diện side panel, hỗ trợ 9 ngôn ngữ.
- Tự làm sạch lệnh (bỏ markdown/đánh số).
- Ẩn đường phụ/nhãn cho hình gọn.
- Lưu lịch sử đề bài/lệnh.

Lưu ý: extension chỉ chạy trên trang geogebra.org/calculator.
```

---

## 7. Upload & phát hành

1. Vào **Developer Console**: https://chrome.google.com/webstore/devconsole
2. **New Item** → upload file `.zip` (§2).
3. Điền **Store listing**: tên, mô tả, screenshot, icon, danh mục, ngôn ngữ.
4. Điền **Privacy practices**: lý do từng permission (§5), khai báo data usage.
5. Chọn **Visibility**: Public / Unlisted / Private.
6. **Submit for review**.
7. Chờ Google duyệt (vài giờ → vài ngày). Có thể bị từ chối nếu thiếu mô tả permission → sửa rồi submit lại.

---

## 8. Cập nhật phiên bản sau này

1. Sửa code → tăng `version` trong `package.json`.
2. `pnpm build` → zip lại (§2).
3. Developer Console → chọn item → **Package** → Upload new package → Submit.
4. Bản cũ vẫn chạy đến khi bản mới được duyệt.

---

## 9. Checklist nộp

- [ ] Version đã tăng.
- [ ] typecheck + lint + test pass.
- [ ] Zip đúng cấu trúc (`manifest.json` ở gốc).
- [ ] Icon 128 + ≥1 screenshot 1280×800.
- [ ] Mô tả ngắn + chi tiết.
- [ ] Khai báo permission + data usage.
- [ ] Submit for review.
