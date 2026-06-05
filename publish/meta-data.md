# Chrome Web Store — Metadata

> Thông tin điền vào Store listing. Hướng dẫn upload: [../specs/publish.md](../specs/publish.md).
> Asset trong thư mục này: `icon-128.png`, `screenshot-1280x800.png`, `promo-tile-440x280.png`.

---

## Thông tin cơ bản

| Mục | Giá trị |
|---|---|
| **Name / Tên** | `GeoGebra AutoDraw AI` |
| **Category / Danh mục** | Education (phụ: Productivity) |
| **Default language** | English |
| **Languages (UI)** | English, Tiếng Việt, 简体中文, Español, Português, Français, Deutsch, 日本語, 한국어 |
| **Version** | lấy từ `package.json` (hiện `1.0.0`) |
| **Visibility** | Public (đề xuất) |

---

## Assets

| Asset | File | Kích thước |
|---|---|---|
| Store icon | `icon-128.png` | 128×128 PNG |
| Screenshot 1 | `screenshot-1280x800.png` | 1280×800 PNG |
| Promo tile nhỏ (tùy chọn) | `promo-tile-440x280.png` | 440×280 PNG |

> Screenshot hiện là **mockup**. Nên thay bằng ảnh chụp thật side panel đang vẽ trên GeoGebra trước khi nộp (đẹp + đúng thực tế hơn).

---

## Short description (≤ 132 ký tự)

**EN:**
```
Auto-draw plane geometry on GeoGebra: build an AI prompt, paste the commands back, and draw in one click.
```

**VI:**
```
Vẽ hình học phẳng tự động trên GeoGebra: sinh prompt cho AI, dán lệnh, vẽ 1 chạm.
```

---

## Detailed description

**EN:**
```
GeoGebra AutoDraw AI bridges an external AI (Gemini, Claude, ChatGPT) and the GeoGebra Calculator.

How it works:
1. Enter a plane-geometry problem.
2. Click "Generate Prompt" and copy it.
3. Paste into an AI and get back a list of GeoGebra commands.
4. Paste the commands into the side panel and click Draw.
5. The figure is drawn automatically in the GeoGebra Calculator tab.

Features:
- Side panel UI, available in 9 languages.
- Auto-cleans pasted commands (removes markdown / numbering).
- Hides helper lines and labels for a clean figure.
- Saves your recent problems and commands.

Note: the extension only works on a geogebra.org/calculator tab. It does not collect or send any of your data — everything is stored locally.
```

**VI:**
```
GeoGebra AutoDraw AI là cầu nối giữa AI (Gemini/Claude/ChatGPT) và GeoGebra Calculator.

Cách dùng:
1. Nhập đề bài hình học phẳng.
2. Bấm "Sinh Prompt" → Copy.
3. Dán sang AI, lấy danh sách lệnh GeoGebra.
4. Dán lệnh vào side panel → bấm Vẽ.
5. Hình được vẽ tự động trên GeoGebra Calculator.

Tính năng:
- Giao diện side panel, hỗ trợ 9 ngôn ngữ.
- Tự làm sạch lệnh (bỏ markdown/đánh số).
- Ẩn đường phụ/nhãn cho hình gọn.
- Lưu lịch sử đề bài/lệnh.

Lưu ý: extension chỉ chạy trên trang geogebra.org/calculator. Không thu thập/gửi dữ liệu — mọi thứ lưu cục bộ.
```

---

## Privacy / Permission justifications

| Permission | Justification (điền vào Privacy practices) |
|---|---|
| `tabs` | Find and track the GeoGebra Calculator tab to draw into. |
| `storage` | Save the last problem, commands, history and UI language locally. |
| `sidePanel` | Show the extension UI in Chrome's side panel. |
| `scripting` | Run `ggbApplet.evalCommand` in the GeoGebra page (MAIN world) to draw the figure. |
| `host_permissions: https://www.geogebra.org/*` | Required for scripting + tab access on the GeoGebra domain. |

- **Data collection:** None. Does not collect user data (all stored in `chrome.storage.local`).
- **Remote code:** No. All code is bundled in the package.
- **Privacy policy URL:** không bắt buộc (khai báo "không thu thập dữ liệu"). Thêm 1 trang nếu store yêu cầu.

---

## Single purpose (nếu store hỏi)

```
A single tool that helps users draw plane-geometry figures on GeoGebra Calculator by generating an AI prompt and running the AI's GeoGebra commands in the page.
```
