# dev.tools — Architecture Decisions Sign-off

**Task**: 5.3 — Sign-off
**Date**: 2026-06-18
**Branch**: feature/claude-automation

---

## Locked Decisions (Phase R — confirmed in latest review)

These four decisions were confirmed during the final review pass and require no further input.

| # | Decision | Resolution | PLAN Ref |
|---|----------|------------|----------|
| L1 | Installer actions | 4 tabs: Install / Update / Upgrade / Remove | R1 |
| L2 | Individual output format | Bare commands only — no shebang/header wrapper | R2 |
| L3 | Linux universal installers | Flatpak/Snap/AppImage merged into every distro family; Universal tab removed | R3 |
| L4 | Tool About panels + prefs | Collapsible `<ToolAbout>` per route (localStorage); theme + sidebar → localStorage | R4 |

---

## Open Decisions — Resolved (user sign-off 2026-06-18)

### O1 — Prompts curation (unblocks Task 2.6)

**Resolution: Full recommendations (Option A)**

Apply all four consolidation targets from the audit in `.tmp/audit/PROMPTS-REVIEW.md`:
1. Merge 6+ per-language code-gen families → 4 generic `{{language}}` prompts (~23 system → 4).
2. Drop the 24-prompt conversational research chain (models do this natively now).
3. Remove 11 system-prompt duplicates of user-prompt text-transform prompts.
4. Merge tone/scenario variants to `{{tone}}`/`{{scenario_type}}` parameters.

**Outcome**: ~70 prompts removed/merged; ~47 remain in a cleaner, parametrised library.

---

### O2 — Formatting scope (unblocks Tasks 1.3 + 2.4)

**Resolution: ✅ set only (Option A)**

Implement: JS / TS / JSON / HTML / CSS / Markdown (`prettier/standalone`) + SQL (`sql-formatter`) + XML (`@prettier/plugin-xml`).

Defer Go (WASM gofmt, too heavy). Drop Java (no viable in-browser formatter). Skip Python.

**Rationale**: Smallest bundle impact; covers the most-used languages. Go/Java/Python deferred.

---

### O3 — Route vs. merge for JSONPath and CSV⇄Markdown (unblocks Tasks 2.1 + 2.3)

**Resolution: Both merged (Option A)**

- **JSONPath query**: add a "Query" tab to the existing `/json-formatter` page.
- **CSV ⇄ Markdown table**: add "Markdown table" as a format option in the existing `/converting-tools` page.

**Rationale**: Keeps sidebar lean; no new routes needed. Features remain discoverable via tab/option expansion.

---

### O4 — Save (overwrite) depth (unblocks Tasks 1.4 + 4.3)

**Resolution: Save As + progressive overwrite (Option A)**

- Implement **Save As…** with native `showSaveFilePicker` + download fallback (works everywhere).
- Implement **Save (overwrite)** as a progressive enhancement: enabled only when the user opened the file via `showOpenFilePicker` (Chromium/Safari 15.4+); otherwise button is disabled/absent.
- Upgrade the **Open** flow to use `showOpenFilePicker` (with `<input type=file>` fallback) to enable the retained-handle path.
- Use `browser-fs-access` ponyfill to handle browser-capability branching.

**Rationale**: Maximises functionality where supported; gracefully degrades on Firefox without blocking the feature.

---

## Summary Table

| # | Type | Decision | Resolution |
|---|------|----------|------------|
| L1 | Locked | Installer actions | 4 tabs: Install / Update / Upgrade / Remove |
| L2 | Locked | Individual output format | Bare commands, no shebang/header |
| L3 | Locked | Linux universal installers | Flatpak/Snap/AppImage merged into distro families; Universal tab removed |
| L4 | Locked | Tool About panels + prefs | Collapsible `<ToolAbout>`; theme + sidebar → localStorage |
| O1 | Resolved | Prompts curation | Full recommendations — ~70 removed, ~47 remain |
| O2 | Resolved | Formatting scope | ✅ set only (JS/TS/JSON/HTML/CSS/MD/SQL/XML); Go/Java/Python deferred/dropped |
| O3 | Resolved | Route vs. merge | Both merged — JSONPath → tab in `/json-formatter`; CSV⇄MD → option in `/converting-tools` |
| O4 | Resolved | Save overwrite depth | Save As + progressive overwrite via `showOpenFilePicker` + `browser-fs-access` ponyfill |

---

## Tasks Unblocked

| Decision | Unblocks |
|----------|----------|
| O1 | Task 2.6 — Prompts curation |
| O2 | Task 1.3 — `formatCode` util; Task 2.4 — Code Editor Format button |
| O3 | Task 2.1 — JSON + JSONPath; Task 2.3 — CSV⇄Markdown |
| O4 | Task 1.4 — File-save upgrade; Task 4.3 — Save overwrite flow |
