---
name: project-conventions
description: Internal dev.tools project conventions — state, styling, contexts, typing, and code style rules
---

# dev.tools Project Conventions

Internal reference skill. Not user-invocable. Apply these conventions whenever reading or writing code in this repo.

## State Management

React Context API only. No Redux, no Zustand, no external state libraries.

The three contexts in `src/components/contexts/`:

| Context                 | Import path                        | Purpose                                                                                            |
| ----------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| `PageContext`           | `@/contexts/PageContext`           | Page title (setPageTitle()), About panel visibility (helpVisible, setHelpVisible, setHasToolAbout) |
| `ToasterContext`        | `@/contexts/ToasterContext`        | User feedback toasts                                                                               |
| `FileOpenContext`       | `@/contexts/FileOpenContext`       | File open dialog                                                                                   |
| `FileSaveDialogContext` | `@/contexts/FileSaveDialogContext` | File save dialog                                                                                   |

## Page Title

Every page component must call `setPageTitle` inside `useEffect`:

```tsx
const { setPageTitle } = usePage();
useEffect(() => {
    setPageTitle('My Page Title');
}, [setPageTitle]);
```

## Styling

- SCSS files live in `src/styles/`
- One `.scss` file per feature area
- Color variables are defined in `src/styles/colors.scss` — use these, do not hardcode hex values
- No CSS-in-JS, no inline styles for anything beyond truly one-off dynamic values

## Path Aliases (tsconfig)

| Alias          | Resolves to                 |
| -------------- | --------------------------- |
| `@/*`          | `src/*`                     |
| `@/contexts/*` | `src/components/contexts/*` |
| `@/controls/*` | `src/components/controls/*` |
| `@/elements/*` | `src/components/elements/*` |
| `@/styles/*`   | `src/styles/*`              |

Always use path aliases for imports that cross feature boundaries.

## Types

Shared types live in `src/common/types.ts`. The key interfaces:

- `IStringUtil` — synchronous tool `{ toolId, textToDisplay, description?, toolFunction: (input: string) => string }`
- `IHashUtil` — async tool `{ toolId, textToDisplay, description?, toolFunction: (input: string) => Promise<string> }`
- `UtilList` — group of tools `{ toolGroupId, displayName, utils: IStringUtil[] }`

Do not redefine these anywhere else. Import from `@/common/types`.

## Factory Functions

All tool factory functions (`createXxxUtils()`, `createXxxUtilList()`) live in `src/common/utils-factory.ts`. Page components import from there — never define tool arrays inline in a page component.

## Prettier Config (from `package.json`)

```json
{
    "printWidth": 120,
    "tabWidth": 4,
    "useTabs": false,
    "semi": true,
    "singleQuote": true,
    "trailingComma": "all",
    "bracketSpacing": true,
    "arrowParens": "always"
}
```

PostToolUse hook auto-runs Prettier on every edit — do not fight the formatter.

## Comments

Write no comments by default. Only add one when the WHY is non-obvious: a hidden constraint, a subtle invariant, or a workaround for a specific bug. Do not document WHAT the code does.

## Disabled Routes

Some sidebar entries are commented out (converting-tools, date-tools, windows-cheat-sheet). The route files still exist. Do not delete them. To re-enable, uncomment the sidebar entry.

## ToolAbout Component

Every tool page that has an "About this tool" collapsible panel must mount `<ToolAbout>`:

```tsx
import ToolAbout from '@/controls/ToolAbout';

// Inside the page JSX, above <ToolView>:
<ToolAbout routeKey="my-tool">One-paragraph description shown when the user opens the About panel.</ToolAbout>;
```

- `routeKey` — kebab-case route identifier; used as the localStorage key `toolAbout:<routeKey>`.
- Visibility is persisted to `localStorage` automatically; default is `false` (hidden).
- The App Bar info button only renders when a `ToolAbout` is mounted (controlled via `setHasToolAbout`).
- Do not add `ToolAbout` to pages that have no meaningful description to show.

## SplitPreviewEditor Component

Use for Monaco-left + rendered-preview-right layouts (Markdown, Mermaid, HTML tools).

```tsx
import SplitPreviewEditor from '../../components/elements/editor/SplitPreviewEditor';

<SplitPreviewEditor
    language="markdown"
    value={content}
    onChange={setContent}
    renderPreview={(val) => <MyRenderer source={val} />}
    editorToolbarChildren={<CopyButton />} // optional
    previewToolbarChildren={<ExportButton />} // optional
/>;
```

The component applies `.editorpane`, `.eh`, and `.eb` CSS primitives from `primitives.scss` internally — do not wrap it in additional pane divs.

## Static Export

The app builds as a static export (`next.config.mjs`: `output: 'export'`). No server-side APIs, no `getServerSideProps`. Use `getStaticProps` / `getStaticPaths` if needed, or client-side data fetching only.
