# dev.tools

Browser-based developer utilities suite built with Next.js and React, deployed as a static site to GitHub Pages.

## Commands

```bash
npm run dev           # Dev server on port 3000
npm run build         # Production build (static export)
npm run lint          # Run ESLint
npm run lint:fix      # Run ESLint with auto-fix
npm run test          # Jest with coverage
npm run format        # Format with Prettier
npm run check:format  # Check formatting without writing
npm run verify        # Full pipeline: format → lint → test
npm run clean         # Remove build artifacts
```

Run a single test file:

```bash
npx jest test/path/to/file.test.ts
```

## Live-Chrome Verification (required for every fix task)

With `npm run dev` running in a separate terminal:

```bash
npm run verify:ui              # Static pass (17 routes × 3 widths × 2 themes) + interaction smoke tests
npm run verify:smoke           # Interaction smoke tests only (6 key flows)
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

1. Create `src/pages/[tool-name]/index.tsx`
2. Use `ToolViewFunctionGroups` (Map) and the generic `ToolView` component from `src/components/elements/column/`
3. Define tools as objects with `toolId`, `textToDisplay`, `toolFunction`
4. See `src/common/utils-factory.ts` for the factory pattern

### State Management

React Context API only — no Redux or Zustand. File I/O via `FileOpenContext` and `FileSaveDialogContext`. User feedback via `ToasterContext`.

### Styling

SCSS files in `src/styles/`. One `.scss` file per feature area. Color variables in `src/styles/colors.scss`.

### Static Export

`next.config.mjs` sets `output: 'export'`. `basePath` and `assetPrefix` are set dynamically from the `GITHUB_REPOSITORY` env var during CI for GitHub Pages deployment.

### Disabled Pages

Some sidebar items are disabled (converting-tools, date-tools, windows-cheat-sheet) — routes exist but are hidden in the sidebar.

## Testing

- Tests live in `test/`
- Config in `jest.config.ts` (jsdom environment)
- Pattern: `**/test/**/*.test.ts(x)`
- Setup file: `test/setup.ts`
