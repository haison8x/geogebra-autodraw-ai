# GeoGebra Prompt Eval Harness

Automated benchmark to measure **how often the AI prompt produces GeoGebra commands
that actually draw the right figure** — so you can iterate on the prompt with numbers
instead of guesswork.

## How it works

```
generate-problems.mjs ──► problems.json      100 template problems + ground truth
        │                                     (expectedPoints, expectedConics)
        ▼
gen-commands.mjs ─────────► results/flash/*.json   real Flash prompt → Gemini → sanitized commands
        │                                          (reuses src/shared/promptTemplate.ts + sanitize.ts)
        ▼
runner.mjs ───────────────► report.json      headless GeoGebra runs each command,
        │                                     checks the expected objects exist
        ▼
report.mjs ───────────────► report.html + console breakdown by category & failing command
```

### Why template-generated problems?

Each problem is built from a template, so we **know the ground truth for free**:
the point names the problem introduces (`A`, `B`, `C`, `M`, `O`…) are deterministic,
while segment/line names are left to the AI. Grading therefore checks **points and
circles**, which are unambiguous.

### Grading (per problem)

`PASS` = all three hold:

| Check      | Meaning                                                                 |
|------------|-------------------------------------------------------------------------|
| `syntaxOk` | No command made `evalCommand` return `false` (valid GeoGebra syntax).   |
| `pointsOk` | Every `expectedPoint` exists, is defined, and has object type `point`.  |
| `conicsOk` | Number of circle/conic objects ≥ `expectedConics`.                      |

The runner reuses the **exact** command-routing from the extension
(`src/background/service-worker.ts`): `ShowLabel` / `SetVisibleInView` / `SetVisible`
go through the JS API, everything else through `evalCommand`. So a pass here means it
would work in the real extension.

## Setup

```bash
pnpm add -D playwright          # already in devDependencies
npx playwright install chromium # one-time browser download
```

Set your Gemini key (the model the extension targets):

```powershell
$env:GEMINI_API_KEY = "your-key"      # PowerShell
```
```bash
export GEMINI_API_KEY="your-key"      # bash
```

Optional: `GEMINI_MODEL` (default `gemini-2.5-flash`).

## Run

```bash
pnpm eval:problems   # regenerate problems.json (deterministic; only if you edit templates)
pnpm eval:gen        # problem → prompt → Gemini → cached commands  (needs GEMINI_API_KEY)
pnpm eval:run        # headless GeoGebra grades every problem → report.json
pnpm eval:report     # console breakdown + eval/report.html

pnpm eval            # gen + run + report in one go
```

### Useful flags

```bash
node eval/gen-commands.mjs --limit 10          # only first 10 problems (quick smoke)
node eval/gen-commands.mjs --force             # re-ask the AI even if cached
node eval/gen-commands.mjs --concurrency 8     # parallel API calls
node eval/runner.mjs --limit 10                # grade first 10
node eval/runner.mjs --headed                  # watch GeoGebra draw (debug)
node eval/runner.mjs --url https://www.geogebra.org/classic   # try a different app
node eval/runner.mjs --keep-going false        # stop each problem at first bad command (like production)
```

`results/flash/*.json` are cached: re-running `eval:gen` only calls the AI for
problems that are missing or previously errored. Use `--force` to refresh.

## Optimizing the prompt with the results

`report.mjs` prints two things that point straight at prompt fixes:

1. **Pass rate by category** — which construction types the AI keeps failing
   (e.g. `triangle-circumcircle 20%` → the circumcircle rule needs work).
2. **Most-failing commands** — the actual commands GeoGebra rejected
   (e.g. many `Circumcenter(...)` failures → strengthen the "illegal commands" rule
   in `src/shared/promptTemplate.ts`).

Workflow: read the breakdown → edit `PROMPT_TEMPLATE` in
`src/shared/promptTemplate.ts` → `pnpm eval:gen --force && pnpm eval:run && pnpm eval:report`
→ compare pass rate. The catalog + prompt are the real ones the extension ships, so
improvements transfer directly.

## Files

| File                    | Purpose                                             |
|-------------------------|-----------------------------------------------------|
| `generate-problems.mjs` | Template → `problems.json` (committed)              |
| `problems.json`         | 100 problems + ground truth (committed)             |
| `gen-commands.mjs`      | Build real Flash prompt, call Gemini, cache output  |
| `runner.mjs`            | Headless GeoGebra grader → `report.json`            |
| `report.mjs`            | Console breakdown + `report.html`                   |
| `lib/catalog.mjs`       | Builds `{{COMMANDS_CATALOG}}` via the real minifier |
| `lib/gemini.mjs`        | Minimal Gemini REST client                          |
| `results/`, `report.*`  | Generated (git-ignored)                             |
