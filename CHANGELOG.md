# Changelog

## [2.0.0] — 2026-06-24

### New tools

- **XML Formatter** (`/xml-formatter`) — DOMParser/XMLSerializer pretty-print with XPath 1.0 query mode
- **Diff** (`/diff`) — Monaco DiffEditor with text, JSON, and XML semantic comparison modes
- **HTML Editor** (`/html-editor`) — Monaco editor with sandboxed iframe live preview, script execution toggle, and dark-mode injection
- **JWT** (`/jwt`) — Web Crypto decode/verify/sign (HS256/384/512), structured claims display with expiry indicators
- **Cron** (`/cron`) — cronstrue + cron-parser: human-readable descriptions, next-N scheduled runs, timezone selector, Quartz and AWS EventBridge dialect support
- **QR** (`/qr`) — qrcode canvas/SVG generation with EC level selector and payload builders for URL, Wi-Fi, vCard, email, SMS, geo, and more
- **Mermaid Editor** (`/mermaid-editor`) — Monaco editor with live debounced SVG render, error overlay, and SVG/PNG export

### Updated tools

- **Prompts Collection** (`/prompts-collection`) — complete overhaul:
    - Hierarchical browser: domain → category → prompt list → detail panel, tabbed navigation
    - Chat and Agent prompt variants per category; model-specific variants
    - Filled vs raw template copy; editable combobox parameters (predefined picks or free text)
    - System-prompt recommendation shown as a tip with a new-tab link
    - Skills library: per-agent install guides, file downloads, ZIP export; expanded detail panel with Scripts section, Install-for selector (Claude Code, GitHub Copilot, OpenCode, Amazon Kiro, OpenAI Codex, JetBrains Junie), Project/User scope toggle, and Invoke section
    - Browse-all catalog with search, facet filters, and Mode column (Chat / Agent / Dual)
    - Style, Tone, and Context pickers for supported variants; rule blocks injected via `assemblePrompt()`; "What this injects" collapsible
    - ChatBot / AI Agent mode toggle (`SegmentedControl`) in detail panel; unified mode badge on list items
    - Model picker uses design-system `Select`; parameter controls use `Textarea`, `Select`, and `Input`
    - Shareable deep links via query parameters (`?domain=…&category=…&prompt=…&style=…&tone=…&context=…`), basePath-safe and PWA-offline-capable
    - Prompt data authored as TypeScript modules under `src/common/prompts/catalog/`; `npm run build:prompts` validates and regenerates the manifest
    - Meta-prompt badges (D01–D03, D05–D06)
- **JSON Formatter**: JSONPath 1.0 query mode powered by jsonpath-plus
- **Markdown Tools**: embedded Mermaid code-fence rendering
- **Code Editor**: language-aware Format button with lazy-loaded Prettier (JS/TS/CSS/HTML/JSON/YAML/Markdown) and sql-formatter
- **Converting Tools**: bidirectional CSV ⇄ Markdown table conversion
- **LLM VRAM Calculator**: effective-bpw quant catalog, GPU-type selector (consumer/datacenter/apple-silicon), custom VRAM manager, KV cache type selector, refined engine-overhead model
- **Software Installer**: Install / Update / Upgrade / Remove action tabs; Individual mode emits bare package-manager commands; Linux universal installer merges flatpak/snap/AppImage entries

### Design system

- New `primitives.scss`: `.btn`, `.editorpane`, `.steplabel`, `.detailsbox`, `.formgrid`, `.textarea-auto`
- Unified `Button` component with `variant` prop mapping to primitive classes
- Shared `EditorToolbar` component replaces per-page Menubar on all editor pages
- Token-aligned Toaster with per-type icon and dismiss button

### New components

- `Textarea` (`src/components/controls/Textarea.tsx`) — reusable multiline input with token-aligned styles
- `AutoTextarea` — JS auto-grow textarea for prompt params and template fields

### Accessibility

- `:focus-visible` outlines added to six interactive Prompts Collection elements (`.pc-btn`, `.pc-domain-tab`, `.pc-list-item`, `.pc-skill-related-link`, `.pc-injects-summary`, `.pc-catalog-share`)
- Consolidated duplicate `.pc-header-right` SCSS, restoring header wrapping at narrow widths
- `SkillDetailPanel` Invoke section uses the `Input` design-system control

### UX / shell

- **Global sidebar**: collapses to an icon rail by default on all routes; state persists via localStorage
- **ToolAbout panels**: collapsible info section on every tool page, persisted open/closed per route in localStorage
- **Theme persistence**: selected theme and sidebar-collapsed state written to localStorage; pre-hydration inline script eliminates flash on load
- **Navigation**: app name in top bar navigates to Dashboard; GitHub icon labelled "GitHub ↗"

### Infrastructure

- PWA: installable, offline-capable service worker via `@ducanh2912/next-pwa`
- `npm run build:prompts` — validates TypeScript catalog (14 invariants) and regenerates manifest + loaders; includes per-extension script syntax validation (`bash -n`, `python3 -m py_compile`, `node --check`)
- `npm run validate:sw` — verifies service worker precache covers all routes after each build
- CI pipeline: `build:prompts` runs as `prebuild`; `validate:sw` runs post-build
- Jest `coverageThreshold` enforced; new tests for URL helpers, list items, and basePath URL forms
- Grep-gate test (`test/docs/stale-terms.test.ts`) prevents legacy terms from re-entering docs or agent config

### Removed

- Legacy hard-coded prompt arrays (`system-prompts.ts`, `user-prompts.ts`, `dev-chat-user-prompts.ts`) and `PromptCategory` enum
- `Menubar` / `menubar.scss` — replaced by `.editorpane .eh`
- `TextEditor` / `LabeledTextEditor` / `texteditor.scss` — replaced by `AutoTextarea` + `.input`
- Deprecated `mac-os-cheat-sheet` redirect page
- Dead CSS: `.pc-param-input`, `.pc-param-select`, `.pc-param-textarea`, `.pc-model-select`
