# GeoGebra AutoDraw AI — Epics

> Nguồn: [README.md](../README.md) · Phương pháp: Spec-Driven Development (SDD)
> Mỗi epic = nhóm công việc giao được, có Definition of Done (DoD) bám Acceptance Criteria (§12).

---

## Epic 0 — Spike & Khả Thi API (P0) ✅ DONE

**Mục tiêu:** Xác nhận `ggbApplet.evalCommand` chạy được trên tab GeoGebra Calculator.

**Stories:**
- [x] Spike console `/calculator`: `evalCommand` vẽ tam giác ABC (§7.3).
- [x] Spike content script `world:"MAIN"`: thấy `ggbApplet`, `evalCommand` + `reset()` chạy (§7.2).
- [x] Xác nhận method khả dụng: `evalCommand`, `reset`, `newConstruction`, `deleteObject`, `getAllObjectNames`, `setCoordSystem`.

**Rủi ro mở:** `chrome.runtime.sendMessage` ở MAIN world (verify ở Epic 3).

**DoD:** Spike artifacts trong [specs/](.); quyết định kiến trúc MAIN world đã chốt (§13.1).

---

## Epic 1 — Project Setup & Foundation (P1) ✅ DONE

**Mục tiêu:** Bộ khung build + tooling chạy được, load unpacked vào Chrome.

**Stories:**
- [x] Setup Vite + `@crxjs/vite-plugin` + React 18 + TypeScript (strict) + Tailwind.
- [x] pnpm scripts: `dev` (HMR), `build`, `test` (Vitest), `typecheck`.
- [x] `manifest.config.ts` (Manifest V3, §8): permissions `tabs`/`storage`, host `geogebra.org/*`, content script `world:"MAIN"`.
- [x] Định nghĩa message types chung `src/shared/messages.ts` (§5).
- [x] Cấu trúc thư mục theo §11.

**DoD:** `pnpm build` ra `dist/` load unpacked không lỗi; `pnpm typecheck` pass.

---

## Epic 2 — Popup UI + Sinh Prompt + Sanitize (P2)

**Mục tiêu:** UI nhập đề → sinh prompt copy 1 chạm → paste lệnh AI → sanitize → preview editable.

**Stories:**
- [x] Form nhập **Đề bài** (§3.1).
- [x] Nút **Sinh Prompt**: ghép `promptTemplate.ts` (§6.3) + danh mục lệnh rút gọn (§6.2) → hiển thị prompt + nút Copy.
- [x] Build-time: sinh `geometry_commands.min.json` (lọc 2D, rút gọn name+syntax+desc) từ `geometry_commands.json` (§6.2).
- [x] Textarea paste lệnh AI → sanitize (§10.1: tách `\n`, bỏ fence ```` ``` ````, bỏ tiền tố `1.`/`-`/`*`, trim, loại dòng rỗng).
- [x] Hiển thị kết quả sanitize ở textarea **editable** để sửa/preview trước khi vẽ.
- [x] Toggle chế độ vẽ: **Xóa trắng vẽ lại** (mặc định) | **Vẽ tiếp** → set `clearFirst`.
- [x] Validate: disable nút Thực thi khi textarea rỗng (§10).
- [x] Unit test (TDD): sanitize + ghép prompt.

**DoD:** AC §12 — sinh prompt copy 1 chạm; prompt yêu cầu lệnh tiếng Anh; sanitize đúng kể cả input có markdown/đánh số; toggle chế độ vẽ có.

---

## Epic 3 — Background + Content Script + Thực Thi evalCommand (P3)

**Mục tiêu:** Pipeline thực thi end-to-end: Popup → Background → Content → `ggbApplet`.

**Stories:**
- [x] Background nghe `EXECUTE_COMMANDS`; mở/dùng tab GeoGebra (`tabs.create`, lưu `targetTabId`).
- [x] Chờ tab `status === 'complete'` (`tabs.onUpdated`) → gửi `RUN_COMMANDS` (§3.2).
- [x] Content script (`world:"MAIN"`) poll chờ `ggbApplet` sẵn sàng (§7.1).
- [x] `clearFirst` → `reset()` trước; loop `evalCommand` từng dòng + delay (§7.1).
- [x] `evalCommand` trả `false` → `COMMAND_ERROR`, **không dừng** batch.
- [x] Relay `PROGRESS` Content → Background → Popup; Popup hiển thị x/n + Hoàn tất.
- [x] `DONE { ok, executed, errors[] }` cuối batch.
- [x] **Verify rủi ro P3:** `chrome.runtime.sendMessage` ở MAIN world. Nếu hạn chế → kiến trúc 2 lớp ISOLATED + inject MAIN qua `window.postMessage` (§7.2).

**DoD:** AC §12 — bấm Thực thi → tab mở, lệnh chạy tuần tự, hình vẽ; delay mỗi dòng; tiến độ + Hoàn tất; lệnh lỗi không dừng batch, liệt kê trong kết quả.

---

## Epic 4 — Edge Cases, Storage/History, Nút Xóa Hình (P4)

**Mục tiêu:** Bền với lỗi runtime; nhớ trạng thái; quản lịch sử.

**Stories:**
- [x] Storage schema `chrome.storage.local` (§9): `lastProblem`, `lastCommandsRaw`, `settings{delayMs=600, clearFirstDefault=true}`, `history`.
- [x] Khôi phục đề bài/lệnh gần nhất khi mở lại Popup.
- [x] Nhớ lựa chọn chế độ vẽ (`clearFirstDefault`).
- [x] History ≤ 20 mục, FIFO khi vượt; bắt `QUOTA_BYTES` (§9, §10).
- [x] Nút **Xóa hình** = `ggbApplet.reset()` (§13.4).
- [x] Edge cases (§10): tab reload giữa chừng (`CONTENT_READY` lại, báo "chạy lại"); `Extension context invalidated` (try-catch mọi `sendMessage`); `ggbApplet` chưa load (poll ≤15s, interval 300ms, timeout → `DONE{ok:false}`); nhiều tab GeoGebra (chỉ thao tác `targetTabId`).

**DoD:** AC §12 — đề/lệnh gần nhất khôi phục; chế độ vẽ nhớ; không crash khi tab reload / context invalidated.

---

## Epic 5 — QA E2E, Polish, Đóng Gói (P5)

**Mục tiêu:** Sản phẩm nghiệm thu được, đóng gói release.

**Stories:**
- [ ] Manual E2E full user journey (§4.1): nhập đề → prompt → AI → paste → vẽ.
- [ ] Chạy hết checklist Acceptance Criteria §12.
- [x] Polish UI Popup (trạng thái, lỗi, loading).
- [x] Đóng gói `dist/` → zip release; hướng dẫn load unpacked (§15).

**DoD:** Toàn bộ AC §12 ✅; build production sạch; package release sẵn sàng.

---

## Epic 6 — Đa Ngôn Ngữ (i18n) (P6)

**Mục tiêu:** Popup hỗ trợ 9 ngôn ngữ, mặc định tiếng Anh, nhớ lựa chọn của user.

**Ngôn ngữ hỗ trợ:** `en` English (mặc định), `vi` Tiếng Việt, `zh-CN` 简体中文, `es` Español, `pt` Português, `fr` Français, `de` Deutsch, `ja` 日本語, `ko` 한국어.

**Stories:**
- [x] Hạ tầng i18n: từ điển chuỗi theo locale (`src/shared/i18n/`), hàm `t(key)`, fallback về `en` khi thiếu key.
- [x] 9 file locale với đầy đủ key UI (labels, buttons, status, errors, mode, history).
- [x] Phát hiện ngôn ngữ ban đầu: `chrome.i18n.getUILanguage()` → map về locale hỗ trợ; không khớp → `en`.
- [x] Selector ngôn ngữ trong Popup; lưu `settings.locale` (§9); nhớ lần sau.
- [x] Localize toàn bộ chuỗi UI Popup qua `t(key)` (không hardcode chuỗi).
- [x] **Giữ command names tiếng Anh** trong prompt (§6.3) bất kể locale (bất biến đảm bảo); localize wording prompt = tùy chọn, CHƯA làm.
- [x] Unit test: `t()` fallback, map locale, mọi locale đủ key (không thiếu/thừa so với `en`).

**DoD:** Đổi ngôn ngữ → UI cập nhật ngay; mặc định English; nhớ lựa chọn khi mở lại; 9 locale đủ key; command names luôn tiếng Anh.

---

## Epic 7 — Hướng Dẫn Sử Dụng + Nút Hướng Dẫn (P7)

**Mục tiêu:** Người dùng mới hiểu cách dùng extension ngay trong Popup, qua nút **Hướng dẫn**; nội dung đa ngôn ngữ.

**Stories:**
- [x] Nút **Hướng dẫn (Help)** trong Popup (icon `?`/`❓` hoặc text), mở panel/modal hướng dẫn.
- [x] Nội dung hướng dẫn theo bước: nhập đề → Sinh Prompt → Copy → dán sang AI → dán lệnh về → chọn chế độ vẽ → Thực thi.
- [x] Mẹo: hình sạch (Segment thay Line, ẩn label/đường phụ §6.3), lệnh tên tiếng Anh.
- [x] Link ngoài: GeoGebra Calculator + ghi chú cài Developer mode (trỏ [manual-test-guide.md](manual-test-guide.md)).
- [x] **Đa ngôn ngữ:** toàn bộ chuỗi hướng dẫn qua `t(key)` (Epic 6), đủ 9 locale, fallback `en`.
- [x] Đóng panel quay lại UI chính; không chặn thao tác.
- [x] Unit test: key hướng dẫn có parity đủ 9 locale (mở rộng parity test §T6.8).

**DoD:** Bấm Hướng dẫn → panel mở với nội dung từng bước; đổi ngôn ngữ → hướng dẫn đổi theo; 9 locale đủ key; đóng được panel.

---

## Truy Vết Epic → Phase → Spec

| Epic | Phase | Sections README | Trạng thái | Chi tiết |
|---|---|---|---|---|
| 0 | P0 | §7.1–7.3, §13.1 | ✅ DONE | [epic-0.md](epic-0.md) |
| 1 | P1 | §2, §5, §8, §11 | ✅ DONE | [epic-1.md](epic-1.md) |
| 2 | P2 | §3.1, §6, §10.1 | ✅ DONE | [epic-2.md](epic-2.md) |
| 3 | P3 | §3.2, §3.3, §4.2, §7 | ✅ DONE | [epic-3.md](epic-3.md) |
| 4 | P4 | §9, §10, §13.4 | ✅ DONE | [epic-4.md](epic-4.md) |
| 5 | P5 | §4.1, §12, §15 | 🚧 Polish+pack DONE; QA E2E manual pending | [epic-5.md](epic-5.md) · [e2e-checklist.md](e2e-checklist.md) |
| 6 | P6 | §16 | ✅ DONE (localize wording prompt = tùy chọn, chưa làm) | [epic-6.md](epic-6.md) |
| 7 | P7 | §17 | ✅ DONE (render test panel = tùy chọn, chưa làm) | [epic-7.md](epic-7.md) |
