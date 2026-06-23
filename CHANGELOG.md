# Changelog

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
