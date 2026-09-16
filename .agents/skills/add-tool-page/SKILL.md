---
name: add-tool-page
description: Add a new tool page to dev.tools — covers ToolView, Editor, and Custom patterns
---

# Add a Tool Page

Three patterns. Choose one and follow it exactly. See `docs/howto/add-a-tool-page.md` for prose context.

---

## Pattern 1 — ToolView (most common)

Use for text-transform tools (input → output, grouped by category).
Reference: `src/pages/string-utils/index.tsx`.

### Steps

- [ ]   1. **Pure utils** — create `src/common/<name>-utils.ts` with exported, pure, testable functions (no React).
- [ ]   2. **Factory functions** — add `create<Name>Utils()` and `create<Name>UtilList()` to `src/common/utils-factory.ts`. Import new functions at the top.
- [ ]   3. **Page component** — create `src/pages/<name>/index.tsx` using the stub below.
- [ ]   4. **Sidebar** — add `{ itemName: '<Display Name>', itemLink: '/<name>', icon: '⊕' }` to the appropriate group in `src/components/app-layout/ApplicationSidebar.tsx`.
- [ ]   5. **Stylesheet** — create `src/styles/<name>.scss`; import it in `src/pages/_app.tsx`.
- [ ]   6. **Unit tests** — `test/common/<name>-utils.test.ts` covering all exported functions + edge cases.
- [ ]   7. **Render test** — `test/pages/<name>.test.tsx` confirming the page mounts without errors.
- [ ]   8. **Verify** — run all four gates:
    ```bash
    npm run verify
    npm run build
    npm run validate:sw
    npm run verify:ui
    ```
- [ ]   9. **Commit** — `git add -A && git commit -m "feat: add <name> tool page"` then `git status` must be clean.

### Page stub

```tsx
'use client';
import { create<Name>UtilList } from '@/common/utils-factory';
import { usePage } from '@/contexts/PageContext';
import ToolAbout from '@/controls/ToolAbout';
import React, { useEffect, useMemo } from 'react';
import ToolView, { ToolViewFunctionGroups, ToolViewGroup } from '../../components/elements/column/ToolView';

const IndexPage = (): React.JSX.Element => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('<Page Title>');
    }, [setPageTitle]);

    const toolsGroups = useMemo(() => {
        const groupsMap: ToolViewFunctionGroups = new Map();
        create<Name>UtilList().forEach((tool) => {
            const toolGroup: ToolViewGroup = {
                funcGroupId: tool.toolGroupId,
                funcGroupName: tool.displayName,
                functions: tool.utils.map((func) => ({
                    funcId: func.toolId,
                    funcName: func.textToDisplay,
                    funcDescription: func.description,
                    func: (text, onSuccess, onFailure) => {
                        try {
                            onSuccess(func.toolFunction(text));
                        } catch (e) {
                            onFailure(e);
                        }
                    },
                })),
            };
            groupsMap.set(tool.toolGroupId, toolGroup);
        });
        return groupsMap;
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <ToolAbout routeKey="<name>">Description shown in the collapsible About panel.</ToolAbout>
            <ToolView searchable showCharCount toolChoseHeader="Select Utils" toolViewFunctionGroups={toolsGroups} />
        </div>
    );
};
export default IndexPage;
```

---

## Pattern 2 — Editor

Use for Monaco-based editor + preview layouts.
Reference: `src/pages/mermaid-editor/index.tsx`.

- Use `SplitPreviewEditor` from `../../components/elements/editor/SplitPreviewEditor`.
- Apply `.editorpane`, `.eh`, `.eb` CSS classes from `primitives.scss` for full-height layout.
- Follow the same sidebar, stylesheet, and verification steps as Pattern 1.

---

## Pattern 3 — Custom

Use for bespoke layouts that don't fit Pattern 1 or 2.
Reference: `src/pages/software-installer/index.tsx`.

- No special layout constraints; use whatever structure the tool needs.
- Follow the same sidebar, stylesheet, test, and verification steps as Pattern 1.

---

## Key constraints

- Tool IDs (`toolId`, `toolGroupId`) must be kebab-case and unique across the app.
- Factory functions always live in `utils-factory.ts`, never in the page component.
- Page components contain only wiring — no business logic.
- Always include a `<ToolAbout>` unless the page has no useful description.
