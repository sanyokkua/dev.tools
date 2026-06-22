# T05-1 Task Brief: loader.ts + loader.test.ts

## Context

This is task T05 in a multi-stage prompts pipeline for dev.tools (Next.js/React static site).
You are adding a new runtime loading module that wraps two generated artifacts behind four memoized functions.

## Files to create (NEW — neither exists yet)

1. `src/common/prompts/loader.ts`
2. `test/common/prompts/loader.test.ts`

## Files NOT to touch

- `src/common/prompts/data.ts` — unchanged
- `src/common/prompts/manifest.generated.ts` — generated, git-ignored
- `src/common/prompts/loaders.generated.ts` — generated, git-ignored
- `src/common/prompts/model/types.ts` — no additions needed
- Any page, component, or script file

## Existing generated files (their exact current shape)

**manifest.generated.ts:**

```typescript
// GENERATED — do not edit. Regenerate with: npm run build:prompts
import type { Manifest } from './model/types';

export const MANIFEST: Manifest = { domains: [], categories: [], logical: [], skills: [] };
```

**loaders.generated.ts:**

```typescript
// GENERATED — do not edit. Regenerate with: npm run build:prompts
import type { LogicalPromptDef, SkillDef } from './model/types';

export const CATEGORY_LOADERS: Record<string, () => Promise<{ prompts: LogicalPromptDef[] }>> = {};

export const SKILL_LOADERS: Record<string, () => Promise<{ skill: SkillDef }>> = {};
```

## Exact implementation for src/common/prompts/loader.ts

Write this file VERBATIM (no changes):

```typescript
import { MANIFEST } from './manifest.generated';
import { CATEGORY_LOADERS, SKILL_LOADERS } from './loaders.generated';
import type { Manifest, LogicalPromptDef, SkillDef } from './model/types';

export function loadManifest(): Manifest {
    return MANIFEST;
}

const _categoryCache: Record<string, Promise<{ prompts: LogicalPromptDef[] }>> = {};

export function loadCategory(categoryCode: string): Promise<{ prompts: LogicalPromptDef[] }> {
    const cached = _categoryCache[categoryCode];
    if (cached) return cached;
    const loader = CATEGORY_LOADERS[categoryCode];
    if (!loader) return Promise.reject(new Error(`Unknown category: ${categoryCode}`));
    return (_categoryCache[categoryCode] = loader());
}

export async function getLogicalPrompt(id: string): Promise<LogicalPromptDef> {
    const match = /^LP-([A-Z]\d+)-/.exec(id);
    if (!match) throw new Error(`Invalid prompt id: ${id}`);
    // match[1] is string (not string|undefined): RegExpExecArray extends Array<string>.
    // noUncheckedIndexedAccess is NOT set in tsconfig.json — confirmed by grep.
    const { prompts } = await loadCategory(match[1]);
    const found = prompts.find((p) => p.id === id);
    if (!found) throw new Error(`Prompt not found: ${id}`);
    return found;
}

const _skillCache: Record<string, Promise<SkillDef>> = {};

export async function loadSkill(slug: string): Promise<SkillDef> {
    const cached = _skillCache[slug];
    if (cached) return cached;
    const loader = SKILL_LOADERS[slug];
    if (!loader) return Promise.reject(new Error(`Unknown skill: ${slug}`));
    return (_skillCache[slug] = loader().then((m) => m.skill));
}
```

## Exact implementation for test/common/prompts/loader.test.ts

Write this file VERBATIM (no changes):

```typescript
import type { LogicalPromptDef, SkillDef, Manifest, Domain, Category } from '@/common/prompts/model/types';

const mockDomain: Domain = {
    code: 'A',
    title: 'Software Engineering',
    slug: 'software-engineering',
    description: 'SE domain',
};
const mockCategory: Category = { code: 'A01', domainCode: 'A', slug: 'code-generation', title: 'Code Generation' };
const mockManifest: Manifest = { domains: [mockDomain], categories: [mockCategory], logical: [], skills: [] };
const mockPrompt: LogicalPromptDef = {
    id: 'LP-A01-sql-query',
    categoryCode: 'A01',
    title: 'Generate a SQL Query',
    description: 'A SQL query generator',
    variantAxes: ['mode'],
    defaultVariantId: 'USR-A01-sql-query',
    variants: [],
};
const mockPrompt2: LogicalPromptDef = {
    id: 'LP-A01-function',
    categoryCode: 'A01',
    title: 'Generate a Function',
    description: 'Function generator',
    variantAxes: [],
    defaultVariantId: 'USR-A01-function',
    variants: [],
};
const mockSkill: SkillDef = {
    id: 'SKILL-code-review',
    slug: 'code-review',
    domainCode: 'A',
    title: 'Code Review',
    version: '1.0.0',
    description: 'Code review skill',
    tags: [],
    allowedTools: [],
    relatedSkillIds: [],
    files: [],
};

describe('loader', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    function mockGenerated(
        categoryLoaders: Record<string, jest.Mock> = {},
        skillLoaders: Record<string, jest.Mock> = {},
    ) {
        jest.doMock('@/common/prompts/manifest.generated', () => ({ MANIFEST: mockManifest }));
        jest.doMock('@/common/prompts/loaders.generated', () => ({
            CATEGORY_LOADERS: categoryLoaders,
            SKILL_LOADERS: skillLoaders,
        }));
    }

    describe('loadManifest', () => {
        it('returns the manifest', async () => {
            mockGenerated();
            const { loadManifest } = await import('@/common/prompts/loader');
            expect(loadManifest()).toBe(mockManifest);
        });

        it('returns the same reference on repeated calls', async () => {
            mockGenerated();
            const { loadManifest } = await import('@/common/prompts/loader');
            expect(loadManifest()).toBe(loadManifest());
        });
    });

    describe('loadCategory', () => {
        it('calls the category loader and returns prompts', async () => {
            const loaderFn = jest.fn().mockResolvedValue({ prompts: [mockPrompt] });
            mockGenerated({ A01: loaderFn });
            const { loadCategory } = await import('@/common/prompts/loader');
            const result = await loadCategory('A01');
            expect(result.prompts).toEqual([mockPrompt]);
            expect(loaderFn).toHaveBeenCalledTimes(1);
        });

        it('memoizes: calls loader only once for repeated calls', async () => {
            const loaderFn = jest.fn().mockResolvedValue({ prompts: [mockPrompt] });
            mockGenerated({ A01: loaderFn });
            const { loadCategory } = await import('@/common/prompts/loader');
            await loadCategory('A01');
            await loadCategory('A01');
            expect(loaderFn).toHaveBeenCalledTimes(1);
        });

        it('deduplicates concurrent calls (single loader invocation)', async () => {
            const loaderFn = jest.fn().mockResolvedValue({ prompts: [mockPrompt] });
            mockGenerated({ A01: loaderFn });
            const { loadCategory } = await import('@/common/prompts/loader');
            await Promise.all([loadCategory('A01'), loadCategory('A01'), loadCategory('A01')]);
            expect(loaderFn).toHaveBeenCalledTimes(1);
        });

        it('rejects with descriptive error for unknown category', async () => {
            mockGenerated();
            const { loadCategory } = await import('@/common/prompts/loader');
            await expect(loadCategory('Z99')).rejects.toThrow('Unknown category: Z99');
        });
    });

    describe('getLogicalPrompt', () => {
        it('loads the category and returns the matching prompt', async () => {
            const loaderFn = jest.fn().mockResolvedValue({ prompts: [mockPrompt, mockPrompt2] });
            mockGenerated({ A01: loaderFn });
            const { getLogicalPrompt } = await import('@/common/prompts/loader');
            const result = await getLogicalPrompt('LP-A01-sql-query');
            expect(result).toBe(mockPrompt);
        });

        it('memoizes the category load when fetching multiple prompts from the same category', async () => {
            const loaderFn = jest.fn().mockResolvedValue({ prompts: [mockPrompt, mockPrompt2] });
            mockGenerated({ A01: loaderFn });
            const { getLogicalPrompt } = await import('@/common/prompts/loader');
            await getLogicalPrompt('LP-A01-sql-query');
            await getLogicalPrompt('LP-A01-function');
            expect(loaderFn).toHaveBeenCalledTimes(1);
        });

        it('rejects for invalid id format (no LP prefix)', async () => {
            mockGenerated();
            const { getLogicalPrompt } = await import('@/common/prompts/loader');
            await expect(getLogicalPrompt('A01-sql-query')).rejects.toThrow('Invalid prompt id: A01-sql-query');
        });

        it('rejects when prompt is not found in the category', async () => {
            const loaderFn = jest.fn().mockResolvedValue({ prompts: [mockPrompt2] });
            mockGenerated({ A01: loaderFn });
            const { getLogicalPrompt } = await import('@/common/prompts/loader');
            await expect(getLogicalPrompt('LP-A01-sql-query')).rejects.toThrow('Prompt not found: LP-A01-sql-query');
        });

        it('propagates rejection for unknown category', async () => {
            mockGenerated();
            const { getLogicalPrompt } = await import('@/common/prompts/loader');
            await expect(getLogicalPrompt('LP-Z99-foo')).rejects.toThrow('Unknown category: Z99');
        });

        it('correctly extracts multi-digit category codes (e.g. B09)', async () => {
            const b09Prompt: LogicalPromptDef = { ...mockPrompt, id: 'LP-B09-translate', categoryCode: 'B09' };
            const loaderFn = jest.fn().mockResolvedValue({ prompts: [b09Prompt] });
            mockGenerated({ B09: loaderFn });
            const { getLogicalPrompt } = await import('@/common/prompts/loader');
            const result = await getLogicalPrompt('LP-B09-translate');
            expect(result).toBe(b09Prompt);
        });
    });

    describe('loadSkill', () => {
        it('loads and returns the skill def', async () => {
            const loaderFn = jest.fn().mockResolvedValue({ skill: mockSkill });
            mockGenerated({}, { 'code-review': loaderFn });
            const { loadSkill } = await import('@/common/prompts/loader');
            const result = await loadSkill('code-review');
            expect(result).toBe(mockSkill);
        });

        it('memoizes: calls loader only once for repeated calls', async () => {
            const loaderFn = jest.fn().mockResolvedValue({ skill: mockSkill });
            mockGenerated({}, { 'code-review': loaderFn });
            const { loadSkill } = await import('@/common/prompts/loader');
            await loadSkill('code-review');
            await loadSkill('code-review');
            expect(loaderFn).toHaveBeenCalledTimes(1);
        });

        it('rejects with descriptive error for unknown slug', async () => {
            mockGenerated();
            const { loadSkill } = await import('@/common/prompts/loader');
            await expect(loadSkill('nonexistent')).rejects.toThrow('Unknown skill: nonexistent');
        });
    });
});
```

## Verification steps (run these, report results)

```bash
# 1. Type-check
npx tsc --noEmit

# 2. Run new tests in isolation
npx jest test/common/prompts/loader.test.ts --coverage

# 3. Run full test suite
npm run test
```

## Commit

```bash
git add src/common/prompts/loader.ts test/common/prompts/loader.test.ts
git commit -m "feat(prompts): T05 — loader.ts runtime loading API (loadManifest/loadCategory/getLogicalPrompt/loadSkill)"
```

DO NOT add generated files: manifest.generated.ts and loaders.generated.ts are git-ignored.

## Report file

Write your full report to: /Users/ok/Development/GitHub/dev.tools/.superpowers/sdd/task-1-report.md

Return only:

- STATUS: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- Commit hash(es)
- One-line test summary
- Any concerns (if DONE_WITH_CONCERNS)
