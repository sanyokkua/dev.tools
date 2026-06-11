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
import { useEffect, useMemo } from 'react';
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

    return <ToolView toolChoseHeader="Select Utils" toolViewFunctionGroups={toolsGroups} />;
};

export default IndexPage;
```

For async tools (hashing), wrap `func.toolFunction` in a `.then(onSuccess).catch(onFailure)` instead of try/catch — see `src/pages/hashing-tools/index.tsx`.

### 4. Register in sidebar — `src/components/app-layout/ApplicationSidebar.tsx`

Add an entry to `sideBarItems`:

```ts
{ itemName: '<Display Name>', itemLink: '/<name>' },
```

To disable a route without removing it (coming soon feature), comment it out with `// TODO: Feature releases`.

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

### 6. Verify

```bash
npm run verify
```

All of: Prettier format → ESLint → Jest tests must pass before considering the tool complete.

## Key constraints

- Tool IDs (`toolId`, `toolGroupId`) must be kebab-case strings, unique across the app.
- `textToDisplay` is the user-visible label — use human-readable casing.
- Factory functions live in `utils-factory.ts`, not in the page component.
- The page component must never contain business logic — only wiring.
- Path alias `@/common/*` maps to `src/common/*`.
