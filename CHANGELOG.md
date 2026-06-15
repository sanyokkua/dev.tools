# Changelog

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
