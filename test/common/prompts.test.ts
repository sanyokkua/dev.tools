import {
    categoriesByDomain,
    defaultVariant,
    findVariantById,
    listDomains,
    logicalByCategory,
    recommendedSystemPromptFor,
    relatedOf,
    replaceParams,
    searchAll,
    skillsByDomain,
    variantsOf,
} from '@/common/prompts/data';
import type { PromptsData, SkillsData } from '@/common/prompts/types';

const FIXTURE_PROMPTS: PromptsData = {
    domains: [{ code: 'A', slug: 'software-engineering', title: 'Software Engineering', description: '' }],
    categories: [
        {
            code: 'A03',
            domainCode: 'A',
            slug: 'code-review',
            title: 'Code Review',
            recommendedSystemPromptId: 'SYS-A03-code-review',
        },
    ],
    logical: [
        {
            id: 'LP-A03-review-change',
            categoryCode: 'A03',
            title: 'Review a Change',
            description: '',
            variantAxes: ['executionContext'],
            defaultVariantId: 'USR-A03-review-change',
            variantIds: ['USR-A03-review-change', 'AGT-A03-review-changes'],
        },
    ],
    variants: [
        {
            id: 'USR-A03-review-change',
            kind: 'user',
            categoryCode: 'A03',
            title: 'Review a Change',
            description: '',
            template: 'Review {{language}}: {{code}}',
            isMetaPrompt: false,
            executionContext: 'chat',
            model: null,
            subVariant: null,
            parameters: [
                { name: 'language', suggestedValues: ['Go', 'TypeScript'], allowCustom: true },
                { name: 'code', allowCustom: true },
            ],
            keywords: ['code review'],
            recommendedSystemPromptId: 'SYS-A03-code-review',
            relatedPromptIds: ['AGT-A03-review-changes'],
            relatedSkillIds: [],
        },
        {
            id: 'AGT-A03-review-changes',
            kind: 'agent',
            categoryCode: 'A03',
            title: 'Review a Change',
            description: '',
            template: 'Autonomously review {{language}}: {{code}}',
            isMetaPrompt: false,
            executionContext: 'agent',
            model: null,
            subVariant: null,
            parameters: [
                { name: 'language', allowCustom: true },
                { name: 'code', allowCustom: true },
            ],
            keywords: ['code review', 'agent'],
            recommendedSystemPromptId: 'SYS-A03-code-review',
            relatedPromptIds: ['USR-A03-review-change'],
            relatedSkillIds: [],
        },
        {
            id: 'SYS-A03-code-review',
            kind: 'system',
            categoryCode: 'A03',
            title: 'Code Review System Prompt',
            description: '',
            template: 'You are a code reviewer.',
            isMetaPrompt: false,
            executionContext: 'chat',
            model: null,
            subVariant: null,
            parameters: [],
            keywords: [],
        },
    ],
};

const FIXTURE_SKILLS: SkillsData = {
    skills: [
        {
            id: 'SKILL-code-review',
            slug: 'code-review',
            domainCode: 'A',
            title: 'code-review',
            version: '1.0.0',
            description: 'Reviews code',
            tags: ['code-review'],
            allowedTools: ['Read', 'Grep'],
            relatedSkillIds: [],
            files: [{ path: 'SKILL.md', role: 'skill', content: '# skill' }],
        },
    ],
};

describe('selectors', () => {
    test('listDomains returns all domains', () => {
        expect(listDomains(FIXTURE_PROMPTS)).toHaveLength(1);
        expect(listDomains(FIXTURE_PROMPTS)[0].code).toBe('A');
    });

    test('categoriesByDomain filters by domain', () => {
        expect(categoriesByDomain(FIXTURE_PROMPTS, 'A')).toHaveLength(1);
        expect(categoriesByDomain(FIXTURE_PROMPTS, 'B')).toHaveLength(0);
    });

    test('logicalByCategory returns logical prompts in a category', () => {
        expect(logicalByCategory(FIXTURE_PROMPTS, 'A03')).toHaveLength(1);
    });

    test('variantsOf returns variants of a logical prompt', () => {
        const vs = variantsOf(FIXTURE_PROMPTS, 'LP-A03-review-change');
        expect(vs).toHaveLength(2);
    });

    test('defaultVariant returns the defaultVariantId variant', () => {
        const dv = defaultVariant(FIXTURE_PROMPTS, 'LP-A03-review-change');
        expect(dv?.id).toBe('USR-A03-review-change');
    });

    test('findVariantById returns correct variant', () => {
        expect(findVariantById(FIXTURE_PROMPTS, 'AGT-A03-review-changes')?.kind).toBe('agent');
    });

    test('findVariantById returns undefined for missing id', () => {
        expect(findVariantById(FIXTURE_PROMPTS, 'USR-MISSING')).toBeUndefined();
    });

    test('recommendedSystemPromptFor looks up via category', () => {
        const sys = recommendedSystemPromptFor(FIXTURE_PROMPTS, 'A03');
        expect(sys?.id).toBe('SYS-A03-code-review');
    });

    test('relatedOf returns related prompt variants', () => {
        const userV = findVariantById(FIXTURE_PROMPTS, 'USR-A03-review-change')!;
        const related = relatedOf(FIXTURE_PROMPTS, userV);
        expect(related.map((r) => r.id)).toContain('AGT-A03-review-changes');
    });

    test('skillsByDomain filters skills by domain', () => {
        expect(skillsByDomain(FIXTURE_SKILLS, 'A')).toHaveLength(1);
        expect(skillsByDomain(FIXTURE_SKILLS, 'D')).toHaveLength(0);
    });

    test('searchAll finds prompt by title keyword', () => {
        const results = searchAll(FIXTURE_PROMPTS, FIXTURE_SKILLS, 'code review');
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].type).toMatch(/prompt|skill/);
    });

    test('searchAll finds skill by description', () => {
        const results = searchAll(FIXTURE_PROMPTS, FIXTURE_SKILLS, 'Reviews code');
        const skillResult = results.find((r) => r.type === 'skill');
        expect(skillResult).toBeDefined();
    });
});

describe('replaceParams', () => {
    test('replaces all params with values', () => {
        const result = replaceParams('Review {{language}}: {{code}}', { language: 'Go', code: 'func main(){}' });
        expect(result).toBe('Review Go: func main(){}');
    });

    test('leaves unmatched params unreplaced', () => {
        const result = replaceParams('Review {{language}}', {});
        expect(result).toBe('Review {{language}}');
    });

    test('handles empty values', () => {
        const result = replaceParams('Hello {{name}}', { name: '' });
        expect(result).toBe('Hello ');
    });
});

describe('multi-axis (model) — inherited system prompt', () => {
    const D02_PROMPTS: PromptsData = {
        domains: [{ code: 'D', slug: 'ai-flows', title: 'AI Flows', description: '' }],
        categories: [
            {
                code: 'D02',
                domainCode: 'D',
                slug: 'image-generation',
                title: 'Image Generation',
                recommendedSystemPromptId: 'SYS-D02-imggen',
            },
        ],
        logical: [
            {
                id: 'LP-D02-imggen',
                categoryCode: 'D02',
                title: 'Image Generation',
                description: '',
                variantAxes: ['model'],
                defaultVariantId: 'USR-D02-imggen-flux2',
                variantIds: ['USR-D02-imggen-flux2', 'USR-D02-imggen-gptImage'],
            },
        ],
        variants: [
            {
                id: 'USR-D02-imggen-flux2',
                kind: 'user',
                categoryCode: 'D02',
                title: 'Image Generation',
                description: '',
                template: '…',
                isMetaPrompt: true,
                executionContext: 'chat',
                model: 'FLUX.2',
                subVariant: null,
                parameters: [],
                keywords: [],
                recommendedSystemPromptId: 'SYS-D02-imggen',
                relatedPromptIds: [],
                relatedSkillIds: [],
            },
            {
                id: 'USR-D02-imggen-gptImage',
                kind: 'user',
                categoryCode: 'D02',
                title: 'Image Generation',
                description: '',
                template: '…',
                isMetaPrompt: true,
                executionContext: 'chat',
                model: 'GPT Image',
                subVariant: null,
                parameters: [],
                keywords: [],
                recommendedSystemPromptId: 'SYS-D02-imggen',
                relatedPromptIds: [],
                relatedSkillIds: [],
            },
            {
                id: 'SYS-D02-imggen',
                kind: 'system',
                categoryCode: 'D02',
                title: 'Image Gen System',
                description: '',
                template: 'You are…',
                isMetaPrompt: false,
                executionContext: 'chat',
                model: null,
                subVariant: null,
                parameters: [],
                keywords: [],
            },
        ],
    };

    test('recommended system prompt is inherited via category for model variants', () => {
        const sys = recommendedSystemPromptFor(D02_PROMPTS, 'D02');
        expect(sys?.id).toBe('SYS-D02-imggen');
    });
});
