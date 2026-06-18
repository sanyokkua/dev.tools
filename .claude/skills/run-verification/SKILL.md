---
name: run-verification
description: Run the complete dev.tools pre-commit verification pipeline
---

# Run Verification

Run these steps in order. Every step must exit 0 before proceeding.

## Prerequisites

Dev server must be running for `verify:ui`. Start it if needed:

```bash
npm run dev   # leave running in a separate terminal; default port 3000
```

## Steps

- [ ]   1. **Format + lint + test**:

    ```bash
    npm run verify
    ```

    Expected: `✓ Prettier · ✓ ESLint · ✓ Jest (coverage)` — all pass.

- [ ]   2. **Static export build**:

    ```bash
    npm run build
    ```

    Expected: build completes without TypeScript or webpack errors.

- [ ]   3. **Service worker precache**:

    ```bash
    npm run validate:sw
    ```

    Expected: all routes appear in `public/sw.js` precache manifest. Fix any missing routes before committing.

- [ ]   4. **Interactive Chrome verification**:

    ```bash
    npm run verify:ui
    ```

    Expected: exits 0 — zero overflow / console-error / font / Monaco-height failures across 17 routes × 3 widths × 2 themes. Screenshots saved to `.tmp/verify-screens/`. If failures, use Chrome DevTools MCP (`mcp__plugin_chrome-devtools-mcp_chrome-devtools__*`) to inspect root cause.

- [ ]   5. **Stage and commit**:

    ```bash
    git add -A
    git commit -m "..."
    ```

- [ ]   6. **Verify clean tree**:

    ```bash
    git status
    ```

    Expected: `nothing to commit, working tree clean`. If any files remain, Prettier or the build generated them — stage and amend the commit.

## Quick reference: individual gates

```bash
npm run verify:smoke                          # interaction smoke tests only (faster than full verify:ui)
npx jest test/path/to/file.test.ts            # single test file
BASE_URL=http://localhost:3000 npm run verify:ui  # explicit base URL
```
