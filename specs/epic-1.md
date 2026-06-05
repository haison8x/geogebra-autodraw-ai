# Epic 1 — Project Setup & Foundation (P1) ✅ DONE

> Nguồn: [README.md](../README.md) §2, §5, §8, §11 · [epics.md](epics.md)
> Mục tiêu: Bộ khung build + tooling chạy được, load unpacked vào Chrome.

---

## Tasks

### T1.1 — Khởi tạo project + pnpm ✅
- [x] `pnpm init`, cấu hình `package.json`.
- [x] Cài Vite + `@crxjs/vite-plugin`.
- [x] Cài React 18 + React DOM.
- [x] Cài Tailwind CSS + PostCSS (`tailwind.config.js`, `postcss.config.js`).

### T1.2 — TypeScript strict ✅
- [x] `tsconfig.json` bật `strict: true`.
- [x] Types cho Chrome extension API (`@types/chrome`).

### T1.3 — Manifest V3 (`manifest.config.ts`) ✅
- [x] `manifest_version: 3`, name, version, `action.default_popup`.
- [x] `background.service_worker` (type module).
- [x] `permissions: ["tabs", "storage"]`.
- [x] `host_permissions: ["https://www.geogebra.org/*"]`.
- [x] Content script `matches: geogebra.org/calculator*`, **`world:"MAIN"`**, `runAt: document_idle`.
- [x] `web_accessible_resources: geometry_commands.min.json`.

### T1.4 — Message types chung (`src/shared/messages.ts`) ✅
- [x] Định nghĩa `ErrorItem` + union `Message` (§5): `EXECUTE_COMMANDS`, `RUN_COMMANDS`, `PROGRESS`, `COMMAND_ERROR`, `DONE`, `CONTENT_READY`.

### T1.5 — Cấu trúc thư mục (§11) ✅
- [x] `src/popup/`, `src/background/`, `src/content/`, `src/shared/`.
- [x] `public/`, `specs/`, `tests/`.

### T1.6 — pnpm scripts ✅
- [x] `dev` (build watch + HMR), `build` (production), `test` (Vitest), `typecheck`.

---

## DoD
- `pnpm build` → `dist/` load unpacked không lỗi.
- `pnpm typecheck` pass.
- 3 thành phần (popup/background/content) build ra artifact.
