---
name: new-tool
description: Scaffold a new tool page in dev.tools following the established pattern
---

# New Tool Scaffold

Use this skill whenever adding a new tool page to dev.tools.

## Steps

### 1. Pure utility functions — `src/common/<name>-utils.ts`

Create a file with pure, testable functions. No React, no side effects.

```ts
export function myTransform(input: string): string {
    return input; // implement
}
```

### 2. Factory functions — `src/common/utils-factory.ts`

Add two exports at the bottom of the file:

```ts
export function create<Name>Utils(): IStringUtil[] {
    return [
        {
            toolId: '<name>-<action>',
            textToDisplay: 'Human Readable Label',
            toolFunction: (input: string) => myTransform(input),
        },
    ];
}

export function create<Name>UtilList(): UtilList[] {
    return [
        {
            toolGroupId: '<name>-group',
            displayName: 'Group Display Name',
            utils: create<Name>Utils(),
        },
    ];
}
```

Import your new functions at the top of `utils-factory.ts`.

### 3. Page component — `src/pages/<name>/index.tsx`

Follow this exact pattern (copy from `src/pages/string-utils/index.tsx`):

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
                    func: (text, onSuccess, onFailure): void => {
                        try {
                            const result = func.toolFunction(text);
                            onSuccess(result);
                        } catch (e: unknown) {
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
            <ToolAbout routeKey="<name>">One-paragraph description of what this tool does.</ToolAbout>
            <ToolView searchable showCharCount toolChoseHeader="Select Utils" toolViewFunctionGroups={toolsGroups} />
        </div>
    );
};

export default IndexPage;
```

For async tools (hashing), wrap `func.toolFunction` in a `.then(onSuccess).catch(onFailure)` instead of try/catch — see `src/pages/hashing-tools/index.tsx`.

### 4. Register in sidebar — `src/components/app-layout/ApplicationSidebar.tsx`

Add an entry to the appropriate group's `items` array in the `navGroups` constant:

```ts
{ itemName: '<Display Name>', itemLink: '/<name>', icon: '?' },
```

Pick a single Unicode character for `icon` that visually relates to the tool. See existing entries in `src/components/app-layout/ApplicationSidebar.tsx` for examples.

### 5. Tests — `test/common/<name>-utils.test.ts`

Write Jest tests for every function in `src/common/<name>-utils.ts`:

```ts
import { myTransform } from '../../src/common/<name>-utils';

describe('<Name>Utils', () => {
    describe('myTransform', () => {
        it('handles normal input', () => {
            expect(myTransform('hello')).toBe('hello');
        });
        it('handles empty string', () => {
            expect(myTransform('')).toBe('');
        });
    });
});
```

### 5b. Render test — `test/pages/<name>.test.tsx`

```tsx
import { render } from '@testing-library/react';
import IndexPage from '../../src/pages/<name>/index';

jest.mock('next/router', () => ({ useRouter: () => ({ pathname: '/<name>' }) }));

describe('<Name> page', () => {
    it('renders without crashing', () => {
        render(<IndexPage />);
        expect(document.body).toBeTruthy();
    });
});
```

### 6. Verify

```bash
npm run verify              # format → lint → tests
npm run build               # static export
npm run validate:sw         # service worker precache covers the new route
npm run verify:ui           # interactive Chrome check — 375/768/1280, light+dark
```

All four must exit 0 before the tool is considered done.

## Key constraints

- Tool IDs (`toolId`, `toolGroupId`) must be kebab-case strings, unique across the app.
- `textToDisplay` is the user-visible label — use human-readable casing.
- Factory functions live in `utils-factory.ts`, not in the page component.
- The page component must never contain business logic — only wiring.
- Path alias `@/common/*` maps to `src/common/*`.
