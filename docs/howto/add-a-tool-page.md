# How to Add a New Tool Page

Three patterns exist. Choose the one that fits your tool.

---

## Pattern 1 — ToolView (most common)

Use for text-transform style tools: one or more input → output operations grouped by category.
Reference: `src/pages/string-utils/index.tsx`.

### Steps

1. **Create the page** at `src/pages/<tool-name>/index.tsx` using the stub below.
2. **Add factory function(s)** to `src/common/utils-factory.ts` (or a new `src/common/<module>.ts`).
3. **Register in the sidebar** — add an entry to the `navGroups` array in `src/components/app-layout/ApplicationSidebar.tsx`.
4. **Add a stylesheet** at `src/styles/<tool-name>.scss` and import it in `src/pages/_app.tsx`.
5. **Add unit tests** for the factory functions in `test/common/<module>.test.ts`.
6. **Add a render test** in `test/pages/<tool-name>.test.tsx`.
7. **Run the full pipeline**: `npm run verify` and `npm run verify:ui`.
8. **Validate the service worker**: `npm run build` then `npm run validate:sw`.

### Page stub

```tsx
import { createMyToolUtils } from '@/common/utils-factory';
import { usePage } from '@/contexts/PageContext';
import ToolAbout from '@/controls/ToolAbout';
import React, { useEffect, useMemo } from 'react';
import ToolView, { ToolViewFunctionGroups, ToolViewGroup } from '../../components/elements/column/ToolView';

const IndexPage = (): React.JSX.Element => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('My Tool');
    }, [setPageTitle]);

    const toolsGroups = useMemo(() => {
        const groupsMap: ToolViewFunctionGroups = new Map();
        createMyToolUtils().forEach((tool) => {
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
            <ToolAbout routeKey="my-tool">Description shown in the collapsible About panel.</ToolAbout>
            <ToolView searchable showCharCount toolChoseHeader="Select Utils" toolViewFunctionGroups={toolsGroups} />
        </div>
    );
};
export default IndexPage;
```

### Sidebar registration

In `src/components/app-layout/ApplicationSidebar.tsx`, add to the appropriate `navGroups` array:

```tsx
{ itemName: 'My Tool', itemLink: '/my-tool', icon: '⊕' },
```

---

## Pattern 2 — Editor

Use for Monaco-based editors and preview panes.
Reference: `src/pages/code-editor/index.tsx`.

Key points:

- Use the `.editorpane`, `.eh`, and `.eb` CSS primitives from `primitives.scss` to get a full-height layout.
- Place two `<MonacoEditor>` instances (or one editor + one preview pane) side by side.
- Follow the same sidebar registration and stylesheet steps from Pattern 1.

---

## Pattern 3 — Custom

Use for complex bespoke pages that do not fit the ToolView or editor mold.
Reference: `src/pages/software-installer/index.tsx`.

No special layout constraints. Use whatever component structure the tool needs. Follow the same sidebar registration, stylesheet, test, and verification steps from Pattern 1.
