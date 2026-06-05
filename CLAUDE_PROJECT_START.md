# Quy Trình Khởi Động Dự Án Với Claude (Project Kickoff Checklist)

Tài liệu này đóng vai trò là quy trình chuẩn để chuẩn bị không gian làm việc, thiết lập ngữ cảnh và định hình phong cách code khi làm việc với Claude (Web UI, Projects hoặc Claude Code CLI).

---

## 📥 LƯU Ý KHI SỬ DỤNG FILE NÀY
* Sao chép nội dung file này thành `CLAUDE_PROJECT_START.md` ở thư mục gốc của dự án.
* Đánh dấu `[x]` vào các công việc đã hoàn thành để theo dõi tiến độ.
* Cung cấp file này cho Claude đọc ngay khi bắt đầu một Session mới để AI hiểu rõ quy trình làm việc bạn mong muốn.

---

## 🗂️ 1. Chuẩn Bị Không Gian Làm Việc (Workspace Setup)
- [x] **Khởi tạo Git Repository:** Chạy `git init` để Claude Code / Agentic workflow có thể theo dõi và tự động commit/review các thay đổi.
- [x] **Cấu hình File Loại Trừ (`.gitignore` & `.claudeignore`):**
    - Loại trừ các thư mục nặng hoặc sinh tự động: `node_modules/`, `build/`, `.expo/`, `dist/`, `.serverless/`.
    - Loại trừ các file chứa thông tin nhạy cảm: `.env`, `.env.local`, `.aws/credentials`.
- [x] **Khởi tạo Cấu Trúc Thư Mục Gốc:** Tạo sẵn các thư mục cốt lõi như `/src`, `/docs`, `/specs`, `/tests` để định hình không gian cho AI làm việc.

## 📝 2. Thiết Lập "Single Source of Truth" (Tài Liệu Cốt Lõi)
- [x] **Tạo File `README.md` Tổng Quan Dự Án:** Ghi rõ mục tiêu dự án, đối tượng người dùng và kiến trúc tổng thể.
- [x] **Xác Định Tech Stack Rõ Ràng (Kèm Phiên Bản):** Vite 5, CRXJS 2, React 18, TS 5 (strict), Tailwind 3, Vitest 2 — xem `README.md` + `package.json`.
- [x] **Tạo File Cấu Hình Dự Án Hoặc Môi Trường Khung:** `package.json`, `tsconfig.json`, `vite.config.ts`, `manifest.config.ts`, `tailwind.config.js`, `postcss.config.js` đã khởi tạo + verify build.

## 🛠️ 3. Định Hình Phong Cách Code & Quy Chuẩn (Coding Standards)
- [x] **Tạo File Quy Chuẩn `.clauderc`:** Định nghĩa các nguyên tắc bắt buộc cho Claude:
    - **Kiến trúc Code:** Functional components, Clean Architecture, SOLID principles.
    - **Định dạng Code:** Luôn viết mã nguồn ngắn gọn, tối ưu, chia nhỏ hàm. Luôn sử dụng TypeScript (strict mode).
    - **Comment Policy:** Không viết comment thừa thãi hay giải thích lại những gì code đã thể hiện rõ ràng.
    - **Xử Lý Lỗi (Error Handling):** Bắt buộc bọc các logic nghiệp vụ/gọi API trong `try-catch`, log lỗi tường minh và trả về thông báo lỗi chuẩn hóa.
    - ** TDD ** Luôn viết test case trước khi viết code chức năng.

## 📐 4. Triển Khai Quy Trình Spec-Driven Development (SDD) cho Extension
- [x] **Thiết Lập Thư Mục `/specs`:** Đã có `specs/README.md` (spec đầy đủ) + spike files.
- [ ] **Quy Trình Tạo Tính Năng Mới:**
    - **Bước 1:** Yêu cầu Claude viết file đặc tả (ví dụ: `specs/popup-feature.md`) gồm:
        - **Luồng xử lý (Flowchart/Mermaid):** Luồng tương tác UI hoặc logic chạy ngầm.
        - **Message Passing Schema:** Định nghĩa chi tiết cấu trúc `action` và `payload` khi truyền tin giữa Popup, Content Script và Background Service Worker.
        - **Permissions Required:** Liệt kê các quyền hệ thống và Content Script Matches cần bổ sung vào `manifest.json`.
        - **Storage Schema:** Cấu trúc dữ liệu lưu trữ trong `chrome.storage.local` hoặc `sync`.
        - **Edge Cases:** Xử lý khi tab bị reload, mất kết nối context (Extension context invalidated), dữ liệu phình to vượt hạn mức storage, hoặc API bên thứ ba bị chặn CORS.
    - **Bước 2:** Review thủ công và chốt file Spec.
    - **Bước 3:** Ra lệnh cho Claude lập trình *chính xác* theo file Spec đã duyệt.

## 🚀 5. Khởi Tạo Session Và Quản Lý Context Đầu Vào (Chrome Extension)
- [ ] **Nạp Tri Thức Vào Claude Projects (Nếu dùng Web UI):** 
    - Tải các file tài liệu cốt lõi lên phần **Project Knowledge**: `README.md`, `system_prompt.md`.
    - Tải kèm tài liệu Chrome API liên quan nếu tính năng phức tạp (ví dụ: tài liệu về `declarativeNetRequest` hoặc `sidePanel`).
    - Gửi file `manifest.json` hiện tại để Claude luôn nắm được phân rã quyền (Permissions) và cấu trúc các script.
- [ ] **Chia Nhỏ Công Việc Theo Môi Trường Độc Lập (Architecture-Based Tasks):** Không ra lệnh code toàn bộ tính năng cùng lúc vì Extension có kiến trúc phân tán. Hãy chia nhỏ task theo từng môi trường:
    - *Ví dụ Task UI:* `Task 1: Thiết kế giao diện và xử lý state cho Popup (React/TypeScript)`.
    - *Ví dụ Task Ngầm:* `Task 2: Viết logic lắng nghe event và xử lý Message Passing trong Background Service Worker`.
    - *Ví dụ Task Tiêm Nhúng:* `Task 3: Viết Content Script để thao tác DOM trên trang target và gửi data về Background`.
- [ ] **Kiểm Soát Context Window & Trạng Thái Đồng Bộ:** 
    - Khi phiên chat quá dài, hãy chủ động start một session mới.
    - Khi sang session mới, nạp lại file `manifest.json` kèm theo file đặc tả (`specs/`) và trạng thái code hiện tại của file bạn đang cần xử lý để tránh Claude bị "lú" giữa code của Popup và code của Content Script.

## 🧪 6. Thiết Lập Chu trình Phản Hồi & Kiểm Thử (Feedback Loop)
- [x] **Tạo Khung Unit Test Sớm:** Vitest đã setup; `tests/sanitize.test.ts` (6 test pass) — TDD cho `sanitize`.
- [ ] **Chuẩn Hóa Cách Cung Cấp Log Lỗi:** Khi xảy ra bug, cung cấp trực tiếp: Toàn bộ Stack Trace lỗi, Trạng thái môi trường, và file code có liên quan. Không mô tả lỗi mơ hồ.