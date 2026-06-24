# Changelog

## [Unreleased]

### Changed

- T19: Docs + agent-config finalization (release gate) — updated `docs/ARCHITECTURE.md` to replace stale directory tree (removed `content/prompts-collection/` and old `generated/*.json` references) with the TypeScript catalog structure (`catalog/`, `skills/`, `registries/`); added "Adding content is data-only" table; updated `docs/DEVELOPER_GUIDE.md` with data-only extension recipes (model, style, tone, context); added data-only how-to recipes to `docs/howto/add-prompts.md` and `.claude/skills/add-prompt/SKILL.md`; added grep gate test (`test/docs/stale-terms.test.ts`) that fails the test suite if banned legacy terms (`ingest-prompts`, `prompts-data.json`, `skills-data.json`, etc.) reappear in docs or agent config.
- T18: PWA/basePath/offline verification + coverage — new `test/common/prompts/data.test.ts` (10 tests) covering `buildSysPromptHref` and `buildCatalogRowHref` with and without `basePath`; added `describe('basePath URLs')` blocks to `PromptDetailPanel.test.tsx` and `PromptCatalogView.test.tsx` asserting prefixed URLs when `NEXT_PUBLIC_BASE_PATH='/dev-tools'`; coverage thresholds confirmed (stmt 96.91% / branch 87.88% / fn 75.72%); production build + `validate:sw` green (24 routes + 38 large chunks precached).
- T17: Accessibility + responsive polish — consolidated 3 duplicate `.pc-header-right` SCSS declarations into 1 canonical (restores header wrapping at narrow widths); added missing SCSS for skill sections (`.pc-skill-scripts`, `.pc-skill-script-row`, `.pc-skill-script-purpose`, `.pc-skill-scripts-note`, `.pc-skill-invoke-prompt`); added `:focus-visible` outlines (`2px solid var(--primary)`) to 6 interactive elements (`.pc-btn`, `.pc-domain-tab`, `.pc-list-item`, `.pc-skill-related-link`, `.pc-injects-summary`, `.pc-catalog-share`). `SkillDetailPanel` Invoke section now uses the `Input` design-system control (replacing raw `<input>`). Added `PromptListItem.test.tsx` (16 tests) and `SkillListItem.test.tsx` (11 tests) covering render + keyboard navigation.
- T16: Skill page — scripts section, expanded install/invoke UI, zip permissions — `SkillDetailPanel` now shows a **Scripts** section listing each bundled script name and purpose with a note on interpreter invocation; the **Install for** target is a 6-agent `Select` (Claude Code, GitHub Copilot, OpenCode, Amazon Kiro, OpenAI Codex, JetBrains Junie) with a Project / User-global scope `SegmentedControl` and a "Copy install prompt" button (script-permissions line included when the skill has scripts); a new **Invoke** section provides a free-text task field and generates a copyable `"Use the {title} skill to {task}"` prompt. `downloadSkillZip` now sets Unix mode `0755` on `scripts/*` entries. All 13 skill TypeScript modules now populate `SkillDef.scripts` descriptors. `build:prompts` gains a V-Skill script syntax sweep (`bash -n` / `python3 -m py_compile` / `node --check` per extension).
- T15: Style/Tone/Context pickers + injected preview — `PromptDetailPanel` shows a "Rewrite characteristics" section with Style, Tone, and Context pickers for variants that declare `supports.style/tone/context = true`. Selecting Context auto-resolves Style + Tone from the registry; selecting Style or Tone manually clears Context. Preview and "Copy prompt" use `assemblePrompt()` — rule blocks injected at `[[INJECT_RULES]]` in the template (or prepended if absent). "What this injects" collapsible `<details>` shows exact STYLE / TONE / STRUCTURE blocks. URL state extended with `?style=&tone=&context=`; Share and deep-links restore picker state. B-domain workplace-communication prompts now declare `supports: { style: true, tone: true, context: true }` and include `[[INJECT_RULES]]` markers.
- T14: Mode toggle axis — dual prompts now show a labeled **ChatBot / AI Agent** `SegmentedControl` in the detail panel; `PromptListItem` shows a unified **Chat / Agent / Dual** mode badge (replacing separate per-mode tags); the Browse-all catalog table gains a **Mode** column (Chat / Agent / Dual). URL parameter `?variant=chat|agent` was already wired; UI now reflects it.
- T13: Replaced raw `<select>` model picker in `PromptDetailPanel` with the `Select` design-system control; model labels now come from the `MODELS` registry. Removed dead `.pc-model-select` SCSS class. Added `aria-label` prop to `Select` component.

### Updated tools

- **Prompts Collection** — parameter controls now use design-system components:
    - Long text inputs (`control: 'textarea'`) render the new `Textarea` component (vertically resizable, token-styled)
    - Enum inputs (`control: 'select'`) render `Select` bound to the value-set registry; non-optional selects auto-initialize to the first value
    - Free text inputs (`control: 'text'`) render `Input` (was raw `<input>`)
    - `EditableCombobox` params unchanged

### New components

- `Textarea` (`src/components/controls/Textarea.tsx`) — reusable multiline input control with `value`, `onChange`, `disabled`, `readOnly`, `placeholder`, `rows`, `block`, `aria-label` props; uses token variables from `textarea.scss`

### Internal

- Removed dead CSS (`.pc-param-input`, `.pc-param-select`, `.pc-param-textarea`) from `prompts-collection.scss`

---

## [4.0.0] — 2026-06-20

### Updated tools

- **Prompts Collection** (`/prompts-collection`) — complete overhaul:
    - Hierarchical browser: domain → category → prompt list → detail panel, tabbed navigation
    - Chat and Agent prompt variants per category
    - Model-specific variants (e.g. image-generation model targeting)
    - Filled vs raw template copy; editable combobox parameters (predefined picks or free text, ≤ 3 per prompt)
    - System-prompt recommendation shown as a tip with a new-tab link
    - Skills library: per-agent install guides, file downloads, ZIP export
    - Browse-all catalog with search and facet filters; row click opens detail view
    - Meta-prompt badges (D01–D03, D05–D06 domain prompts are meta-prompts)
    - Shareable deep links via query parameters (`?domain=…&category=…&prompt=…`), basePath-safe and PWA-offline-capable
    - Prompt data authored as TypeScript modules under `src/common/prompts/catalog/`; `npm run build:prompts` validates and regenerates the manifest

### Removed

- Legacy hard-coded prompt arrays (`system-prompts.ts`, `user-prompts.ts`, `dev-chat-user-prompts.ts`) and `PromptCategory` enum — replaced by the file-based ingestion pipeline

### UX / shell

- **Global sidebar**: collapses to an icon rail by default on all routes; state persists across sessions via localStorage

### Infrastructure

- `npm run build:prompts` — validates TypeScript catalog (14 invariants) and regenerates `manifest.generated.ts` + `loaders.generated.ts` (git-ignored)
- CI pipeline (`nextjs.yml`): `build:prompts` runs as `prebuild`; `validate:sw` runs post-build

---

## [3.0.0] — 2026-06-17

### New tools

- **XML Formatter** (`/xml-formatter`) — DOMParser/XMLSerializer pretty-print with XPath 1.0 query mode
- **Diff** (`/diff`) — Monaco DiffEditor with text, JSON, and XML semantic comparison modes
- **HTML Editor** (`/html-editor`) — Monaco editor with sandboxed iframe live preview, script execution toggle, and dark-mode injection
- **JWT** (`/jwt`) — Web Crypto decode/verify/sign (HS256/384/512), structured claims display with expiry indicators
- **Cron** (`/cron`) — cronstrue + cron-parser: human-readable descriptions, next-N scheduled runs, timezone selector, Quartz and AWS EventBridge dialect support
- **QR** (`/qr`) — qrcode canvas/SVG generation with EC level selector and payload builders for URL, Wi-Fi, vCard, email, SMS, geo, and more
- **Mermaid Editor** (`/mermaid-editor`) — Monaco editor with live debounced SVG render, error overlay, and SVG/PNG export

### Updated tools

- **JSON Formatter**: JSONPath 1.0 query mode powered by jsonpath-plus, with path extraction and result display
- **Markdown Tools**: embedded Mermaid code-fence rendering via dynamic mermaid import
- **Code Editor**: language-aware Format button with lazy-loaded Prettier (JS/TS/CSS/HTML/JSON/YAML/Markdown) and sql-formatter
- **Converting Tools**: bidirectional CSV ⇄ Markdown table conversion added to the format roster
- **LLM VRAM Calculator**: effective-bpw quant catalog, GPU-type selector (consumer/datacenter/apple-silicon), custom VRAM manager with GB input, KV cache type selector (fp16/fp8/int8/int4), and refined engine-overhead model
- **Software Installer**: Install / Update / Upgrade / Remove action tabs; Individual mode emits bare package-manager commands; Linux universal installer merges flatpak/snap/AppImage entries across all distros
- **Prompts Collection**: ToolAbout collapsible panel added; prompt template parameters persist to localStorage

### UX / shell

- **ToolAbout panels**: collapsible info section on every tool page, persisted open/closed per route in localStorage (expanded on first visit)
- **Theme persistence**: selected theme and sidebar-collapsed state written to localStorage; pre-hydration inline script applies the theme before first paint (no flash)
- **Navigation**: app name in the top bar navigates to the Dashboard; GitHub icon labelled "GitHub ↗"
- **Setup & Installer pages**: consistent code-block spacing and step-label alignment

### Infrastructure

- PWA precache `maximumFileSizeToCacheInBytes` raised to 8 MB to accommodate Monaco worker chunks
- `npm run validate:sw` script added — verifies `public/sw.js` precache covers all 24 routes after each build
- Jest `coverageThreshold` enforced at statement/line 80 %, branch 70 %, function 60 %
- Component tests added: `ScriptOutput`, `AppBasket`, `VramResultsDisplay`
- `smoke-tests.mjs` extended to 28 interaction flows (String Utils, Encoding Tools, LLM VRAM, Diff, HTML Editor, JWT, Cron, QR added)

---

## [2.0.0] — 2026-06-15

### Design system

- New `primitives.scss`: `.btn`, `.editorpane`, `.steplabel`, `.detailsbox`, `.formgrid`, `.textarea-auto`
- Unified `Button` component maps `variant` prop to `.btn` + primitive class
- Shared `EditorToolbar` component replaces per-page Menubar on all editor pages
- Token-aligned Toaster: radius/shadow, per-type icon, dismiss button

### Pages redesigned

- **String Utils / Encoding Tools**: `.editorpane` panes, Use-as-input `⇄` icon, rounded chrome
- **JSON Formatter**: `.card.pad` center column, `.editorpane` editor panes
- **Hashing Tools**: `.editorpane` input, `.t` results table, ghost copy buttons
- **Markdown Tools**: `.btn` ghost toolbar, `.card.pad` info row, `.editorpane` editor
- **Date Tools**: `.btn.primary` Convert, `.btn.ghost` Now/copy
- **Terminal Utils**: `&` = `.btn.tonal`, `&&` = `.btn.primary` join buttons
- **VRAM Calculator**: `.card.pad` sections, `.detailsbox` Advanced/MoE, `.chip` presets, `.formgrid` layout
- **macOS / Windows / Linux Setup**: `SegmentedControl` tabs, `.card.pad` steps, `.steplabel` numbering
- **Prompts Collection**: `AutoTextarea` auto-grow inputs, retired `TextEditor`/`texteditor.scss`
- **Dashboard**: removed NEW badges, added macOS ⌘ icon
- **Software Installer**: platform icons, styled Build button, method default ≠ Auto, unavailability guard, labeled pills, multi-version JDK chip multi-select

### New features

- **PWA**: installable, offline-capable, service worker via `@ducanh2912/next-pwa`
- **GitHub Pages favicon/manifest fix**: all hrefs prefixed with `NEXT_PUBLIC_BASE_PATH`
- **Multi-version JDK selection**: chip multi-select in basket; script builder emits one install command per checked major version
- **AutoTextarea**: JS auto-grow textarea for prompt params and template fields

### Dependencies

- React 19.2.7, Jest 30.4, Sass 1.101, TypeScript ESLint 8.61 (in-range bumps)

### Removed

- `Menubar` / `menubar.scss` — replaced by `.editorpane .eh`
- `TextEditor` / `LabeledTextEditor` / `texteditor.scss` — replaced by `AutoTextarea` + `.input`
- `InformationPanel` chips on Markdown — replaced by `.card.pad`
- `PaperContainer` / `.paper` on VRAM — replaced by `.card.pad`
- Bespoke tab/distro selectors on Setup pages — replaced by `SegmentedControl`
- Deprecated `mac-os-cheat-sheet` redirect page
- `--surface-variant` undefined token references — replaced with `--card-2`
