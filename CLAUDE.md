# dev.tools

Browser-based developer utilities suite built with Next.js and React, deployed as a static site to GitHub Pages.

## Commands

```bash
npm run dev           # Dev server on port 3000
npm run build         # Production build (static export)
npm run validate:sw   # Validates that public/sw.js precache covers all routes; run after every build
npm run lint          # Run ESLint
npm run lint:fix      # Run ESLint with auto-fix
npm run test          # Jest with coverage
npm run format        # Format with Prettier
npm run check:format  # Check formatting without writing
npm run verify        # Full pipeline: format → lint → test
npm run clean         # Remove build artifacts
npm run verify:smoke  # Playwright interaction smoke tests only (28+ flows); requires dev server
npm run verify:ui     # Responsive check (24 routes × 3 widths × 2 themes) + smoke tests; requires dev server
```

Run a single test file:

```bash
npx jest test/path/to/file.test.ts
```

## Live-Chrome Verification (required for every fix task)

With `npm run dev` running in a separate terminal:

```bash
npm run verify:ui              # Static pass (24 routes × 3 widths × 2 themes) + interaction smoke tests
npm run verify:smoke           # Interaction smoke tests only (28+ flows)
BASE_URL=http://localhost:3000 npm run verify:ui  # explicit base (same as default)
```

The script saves screenshots to `.tmp/verify-screens/` and exits 1 on any:

- Horizontal overflow (`scrollWidth > clientWidth + 1px`)
- Console errors / page errors
- Serif font detected on `document.body`
- Monaco editor height ≤ 200px on editor pages

**Chrome DevTools MCP** (interactive debugging, already globally available in Claude Code):
Use `mcp__plugin_chrome-devtools-mcp_chrome-devtools__*` tools for step-by-step inspection —
navigate pages, read console, take screenshots, inspect computed styles. Pairs with `verify:ui`
for root-cause debugging.

ALWAYS USE CHROME LIVE APP TESTING AFTER EACH ACCOMPLISHED TASK

## Mandatory Workflow (Before Every Commit)

Run these steps in order after every code change — no exceptions:

1. `npm run verify` — format → lint → tests must all pass
2. `npm run build` — static export must succeed
3. `npm run validate:sw` — service worker precache must cover all routes
4. `npm run verify:ui` — zero overflow / console-error / font failures across all 24 routes at 375 / 768 / 1280 px, light + dark
5. `git add -A && git commit -m "..."` — stage everything and commit
6. `git status` — working tree must be clean (no uncommitted generated files)

Use the `run-verification` skill for a guided walkthrough.

## Architecture

**Stack**: Next.js 16 (Pages Router), React 19, TypeScript, SCSS, Monaco Editor. Deployed as static export to GitHub Pages.

### Directory Structure

- `src/pages/` — Next.js routes, one folder per tool
- `src/components/app-layout/` — top bar, sidebar, main layout
- `src/components/contexts/` — React Context providers (PageContext, ToasterContext, FileOpenContext, FileSaveDialogContext)
- `src/components/controls/` — reusable UI (Button, Input, Select, Modal, TextEditor/Monaco wrapper)
- `src/components/layouts/` — layout primitives (flex/grid containers)
- `src/components/page-specific/` — complex feature components (VRAM calculator, prompts, git cheat sheet)
- `src/common/` — pure utility functions and type definitions

### Path Aliases (tsconfig)

- `@/*` → `src/*`
- `@/contexts/*` → `components/contexts/*`
- `@/controls/*` → `components/controls/*`
- `@/elements/*` → `components/elements/*`
- `@/styles/*` → `styles/*`

## Key Patterns

### Adding a New Tool Page

Invoke the `new-tool` skill — it encodes the full step-by-step process including ToolAbout wiring, render tests, and service-worker validation. See also: `docs/howto/add-a-tool-page.md`.

### State Management

React Context API only — no Redux or Zustand. File I/O via `FileOpenContext` and `FileSaveDialogContext`. User feedback via `ToasterContext`.

### Styling

SCSS files in `src/styles/`. One `.scss` file per feature area. Color variables in `src/styles/colors.scss`.

### Static Export

`next.config.mjs` sets `output: 'export'`. `basePath` and `assetPrefix` are set dynamically from the `GITHUB_REPOSITORY` env var during CI for GitHub Pages deployment.

## Testing

- Tests live in `test/`
- Config in `jest.config.ts` (jsdom environment)
- Pattern: `**/test/**/*.test.ts(x)`
- Setup file: `test/setup.ts`

## Verification Rule

Verification scope is the whole branch, not just my diff. If a test, lint, or responsive check fails anywhere in the branch, it is in scope and must be fixed. "Pre-existing" or "not introduced by this change" is not a valid reason to skip a failure — it's a reason to fix it now or log it as an explicit tracked task. Never report a known failure as acceptable.

Acceptance includes: npm run verify:ui exits clean with zero overflow/console failures across all routes at 375/768/1280. A nonzero count fails the task regardless of whether this task introduced it.

## Available Skills (`.claude/skills/`)

| Skill                 | Purpose                                                       |
| --------------------- | ------------------------------------------------------------- |
| `project-conventions` | Internal conventions — state, styling, types, factory pattern |
| `new-tool`            | Scaffold a new ToolView-pattern tool page end-to-end          |
| `add-tool-page`       | Add any tool page (ToolView, Editor, or Custom pattern)       |
| `add-prompt`          | Add a prompt to the prompts collection                        |
| `add-software`        | Add software to the apps catalog                              |
| `update-vram-model`   | Extend the LLM VRAM calculator engine                         |
| `run-verification`    | Run the complete pre-commit verification pipeline             |

For how-to guides in prose form: `docs/howto/`.
