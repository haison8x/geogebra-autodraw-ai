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

**ZH-CN:**
```
在 GeoGebra 上自动绘制平面几何图形：生成 AI Prompt，粘贴命令，一键绘图。
```

**ES:**
```
Dibuja geometría plana automáticamente en GeoGebra: genera un prompt de IA, pega los comandos y dibuja.
```

**PT:**
```
Desenhe geometria plana no GeoGebra automaticamente: gere um prompt de IA, cole os comandos e desenhe.
```

**DE:**
```
Plangeometrie automatisch in GeoGebra zeichnen: KI-Prompt generieren, Befehle einfügen, mit einem Klick zeichnen.
```

**JA:**
```
GeoGebra で平面図形を自動描画：AI プロンプトを生成し、コマンドを貼り付けて一発で描く。
```

**KO:**
```
GeoGebra에서 평면 기하학 자동 그리기: AI 프롬프트 생성 → 명령 붙여넣기 → 한 번에 그리기.
```

**FR:**
```
Dessinez automatiquement de la géométrie plane sur GeoGebra : générez un prompt IA, collez les commandes et dessinez.
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

**ZH-CN:**
```
GeoGebra AutoDraw AI 是连接外部 AI（Gemini、Claude、ChatGPT）与 GeoGebra 计算器的 Chrome 扩展程序。

使用方法：
1. 输入平面几何题目。
2. 点击「生成 Prompt」并复制。
3. 粘贴到 AI，获取 GeoGebra 命令列表。
4. 将命令粘贴到侧边栏，点击「绘制」。
5. 图形将自动绘制在 GeoGebra 计算器中。

功能特色：
- 侧边栏界面，支持 9 种语言。
- 自动清理命令（去除 Markdown / 编号）。
- 隐藏辅助线和标签，保持图形整洁。
- 保存最近的题目和命令记录。

注意：扩展程序仅在 geogebra.org/calculator 页面上运行。不收集或发送任何数据——一切均本地存储。
```

**ES:**
```
GeoGebra AutoDraw AI conecta una IA externa (Gemini, Claude, ChatGPT) con la Calculadora de GeoGebra.

Cómo funciona:
1. Introduce un problema de geometría plana.
2. Haz clic en "Generar Prompt" y cópialo.
3. Pégalo en una IA y obtén una lista de comandos de GeoGebra.
4. Pega los comandos en el panel lateral y haz clic en Dibujar.
5. La figura se dibuja automáticamente en la Calculadora de GeoGebra.

Características:
- Interfaz de panel lateral, disponible en 9 idiomas.
- Limpia automáticamente los comandos pegados (elimina markdown / numeración).
- Oculta líneas auxiliares y etiquetas para una figura limpia.
- Guarda tus problemas y comandos recientes.

Nota: la extensión solo funciona en una pestaña de geogebra.org/calculator. No recopila ni envía ninguno de tus datos — todo se almacena localmente.
```

**PT:**
```
GeoGebra AutoDraw AI conecta uma IA externa (Gemini, Claude, ChatGPT) à Calculadora do GeoGebra.

Como funciona:
1. Insira um problema de geometria plana.
2. Clique em "Gerar Prompt" e copie.
3. Cole em uma IA e obtenha uma lista de comandos do GeoGebra.
4. Cole os comandos no painel lateral e clique em Desenhar.
5. A figura é desenhada automaticamente na Calculadora do GeoGebra.

Recursos:
- Interface de painel lateral, disponível em 9 idiomas.
- Limpa automaticamente os comandos colados (remove markdown / numeração).
- Oculta linhas auxiliares e rótulos para uma figura limpa.
- Salva seus problemas e comandos recentes.

Observação: a extensão funciona apenas em uma aba geogebra.org/calculator. Não coleta nem envia nenhum dado — tudo é armazenado localmente.
```

**DE:**
```
GeoGebra AutoDraw AI verbindet eine externe KI (Gemini, Claude, ChatGPT) mit dem GeoGebra-Rechner.

So funktioniert es:
1. Gib ein ebenes Geometrieproblem ein.
2. Klicke auf „Prompt generieren" und kopiere ihn.
3. Füge ihn in eine KI ein und erhalte eine Liste von GeoGebra-Befehlen.
4. Füge die Befehle in das Seitenpanel ein und klicke auf Zeichnen.
5. Die Figur wird automatisch im GeoGebra-Rechner gezeichnet.

Funktionen:
- Seitenpanel-Oberfläche, in 9 Sprachen verfügbar.
- Bereinigt eingefügte Befehle automatisch (entfernt Markdown / Nummerierung).
- Blendet Hilfslinien und Beschriftungen für eine übersichtliche Figur aus.
- Speichert deine letzten Aufgaben und Befehle.

Hinweis: Die Erweiterung funktioniert nur auf einem geogebra.org/calculator-Tab. Es werden keine Daten gesammelt oder gesendet — alles wird lokal gespeichert.
```

**JA:**
```
GeoGebra AutoDraw AI は、外部 AI（Gemini、Claude、ChatGPT）と GeoGebra 電卓を繋ぐ Chrome 拡張機能です。

使い方：
1. 平面幾何学の問題を入力します。
2. 「プロンプトを生成」をクリックしてコピーします。
3. AI に貼り付けて GeoGebra コマンドのリストを取得します。
4. コマンドをサイドパネルに貼り付けて「描画」をクリックします。
5. GeoGebra 電卓に図形が自動的に描かれます。

機能：
- サイドパネル UI、9 言語対応。
- 貼り付けたコマンドを自動クリーニング（Markdown・番号を除去）。
- 補助線とラベルを非表示にしてすっきりした図を作成。
- 最近の問題とコマンドを保存。

注意：この拡張機能は geogebra.org/calculator のタブでのみ動作します。データの収集・送信は一切行いません。すべてローカルに保存されます。
```

**KO:**
```
GeoGebra AutoDraw AI는 외부 AI(Gemini, Claude, ChatGPT)와 GeoGebra 계산기를 연결하는 Chrome 확장 프로그램입니다.

사용 방법：
1. 평면 기하학 문제를 입력합니다.
2. "프롬프트 생성"을 클릭하고 복사합니다.
3. AI에 붙여넣어 GeoGebra 명령 목록을 받습니다.
4. 사이드 패널에 명령을 붙여넣고 "그리기"를 클릭합니다.
5. GeoGebra 계산기에 도형이 자동으로 그려집니다.

기능：
- 사이드 패널 UI, 9개 언어 지원.
- 붙여넣은 명령 자동 정리 (마크다운 / 번호 제거).
- 깔끔한 도형을 위해 보조선과 레이블 숨기기.
- 최근 문제 및 명령 저장.

참고: 이 확장 프로그램은 geogebra.org/calculator 탭에서만 작동합니다. 데이터를 수집하거나 전송하지 않습니다. 모든 데이터는 로컬에 저장됩니다.
```

**FR:**
```
GeoGebra AutoDraw AI fait le lien entre une IA externe (Gemini, Claude, ChatGPT) et la Calculatrice GeoGebra.

Comment ça marche :
1. Saisissez un problème de géométrie plane.
2. Cliquez sur « Générer le Prompt » et copiez-le.
3. Collez-le dans une IA et obtenez une liste de commandes GeoGebra.
4. Collez les commandes dans le panneau latéral et cliquez sur Dessiner.
5. La figure est dessinée automatiquement dans la Calculatrice GeoGebra.

Fonctionnalités :
- Interface panneau latéral, disponible en 9 langues.
- Nettoie automatiquement les commandes collées (supprime le markdown / la numérotation).
- Masque les lignes auxiliaires et les étiquettes pour une figure épurée.
- Enregistre vos problèmes et commandes récents.

Remarque : l'extension fonctionne uniquement sur un onglet geogebra.org/calculator. Elle ne collecte ni n'envoie aucune de vos données — tout est stocké localement.
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
