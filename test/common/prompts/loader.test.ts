import type { Category, Domain, LogicalPromptDef, Manifest, SkillDef } from '@/common/prompts/model/types';

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
