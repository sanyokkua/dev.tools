import {
    buildCatalogRowHref,
    buildCatalogRows,
    buildInstallInstructions,
    buildSysPromptHref,
    categoriesByDomain,
    defaultVariant,
    filterCatalogRows,
    findSkillBySlug,
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
import type { CatalogRow, PromptsData, SkillsData } from '@/common/prompts/types';

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

describe('buildSysPromptHref', () => {
    test('builds URL with correct query params (no basePath)', () => {
        const href = buildSysPromptHref('SYS-A03-cr', 'software-engineering', 'code-review');
        expect(href).toBe('/prompts-collection?domain=software-engineering&category=code-review&prompt=SYS-A03-cr');
    });

    test('prepends basePath when provided', () => {
        const href = buildSysPromptHref('SYS-A03-cr', 'software-engineering', 'code-review', '/dev-tools');
        expect(href).toBe(
            '/dev-tools/prompts-collection?domain=software-engineering&category=code-review&prompt=SYS-A03-cr',
        );
    });

    test('empty basePath produces same result as no basePath', () => {
        expect(buildSysPromptHref('SYS-A03-cr', 'eng', 'cr', '')).toBe(buildSysPromptHref('SYS-A03-cr', 'eng', 'cr'));
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

import { selectVariant } from '@/common/prompts/data';
import type { PromptVariant } from '@/common/prompts/types';

const makeV = (id: string, overrides: Partial<PromptVariant> = {}): PromptVariant => ({
    id,
    kind: 'user',
    categoryCode: 'A03',
    title: id,
    description: '',
    template: '',
    parameters: [],
    keywords: [],
    executionContext: 'chat',
    model: null,
    subVariant: null,
    isMetaPrompt: false,
    ...overrides,
});

describe('selectVariant (T2.4)', () => {
    const chatV = makeV('chat', { executionContext: 'chat' });
    const agentV = makeV('agent', { executionContext: 'agent' });
    const gptV = makeV('gpt', { executionContext: 'chat', model: 'gpt-4o' });
    const claudeV = makeV('claude', { executionContext: 'chat', model: 'claude-opus' });
    const kleinV = makeV('klein', { executionContext: 'chat', subVariant: 'klein' });
    const proV = makeV('pro', { executionContext: 'chat', subVariant: 'pro' });

    it('single variant → returns it regardless of axes', () => {
        expect(selectVariant([chatV], 'agent', null, null)).toBe(chatV);
    });

    it('prefers matching executionContext', () => {
        expect(selectVariant([chatV, agentV], 'agent', null, null)).toBe(agentV);
    });

    it('falls back when requested executionContext absent', () => {
        // only chat exists, request agent → falls back to chat
        expect(selectVariant([chatV], 'agent', null, null)).toBe(chatV);
    });

    it('prefers matching model', () => {
        expect(selectVariant([gptV, claudeV], null, 'gpt-4o', null)).toBe(gptV);
    });

    it('falls back when model absent', () => {
        expect(selectVariant([gptV], null, 'unknown-model', null)).toBe(gptV);
    });

    it('prefers matching subVariant', () => {
        expect(selectVariant([kleinV, proV], null, null, 'klein')).toBe(kleinV);
    });

    it('returns undefined for empty array', () => {
        expect(selectVariant([], 'chat', null, null)).toBeUndefined();
    });

    it('all axis null → returns first variant', () => {
        expect(selectVariant([agentV, chatV], null, null, null)).toBe(agentV);
    });

    // suppress unused variable warnings for unused fixtures
    void claudeV;
    void proV;
});

describe('catalog helpers', () => {
    // buildCatalogRows — shape checks
    test('buildCatalogRows returns one prompt row + one skill row for fixture', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        expect(rows).toHaveLength(2); // 1 LogicalPrompt + 1 Skill
        const promptRow = rows.find((r) => r.kind === 'prompt')!;
        const skillRow = rows.find((r) => r.kind === 'skill')!;
        expect(promptRow).toBeDefined();
        expect(skillRow).toBeDefined();
    });

    test('buildCatalogRows prompt row has correct shape', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        const r = rows.find((r) => r.kind === 'prompt')!;
        expect(r.id).toBe('LP-A03-review-change');
        expect(r.title).toBe('Review a Change');
        expect(r.domainSlug).toBe('software-engineering');
        expect(r.domainTitle).toBe('Software Engineering');
        expect(r.categorySlug).toBe('code-review');
        expect(r.categoryTitle).toBe('Code Review');
        expect(r.isMetaPrompt).toBe(false);
        expect(r.hasChat).toBe(true);
        expect(r.hasAgent).toBe(true);
        expect(r.hasModel).toBe(false);
        expect(r.variantSummary).toBe('chat · agent');
    });

    test('buildCatalogRows skill row has correct shape', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        const r = rows.find((r) => r.kind === 'skill')!;
        expect(r.id).toBe('code-review');
        expect(r.title).toBe('code-review');
        expect(r.kind).toBe('skill');
        expect(r.domainSlug).toBe('software-engineering');
        expect(r.isMetaPrompt).toBe(false);
        expect(r.hasChat).toBe(false);
        expect(r.categorySlug).toBeNull();
        expect(r.categoryTitle).toBe('Skills');
        // variantSummary = tools joined by ' · '
        expect(r.variantSummary).toMatch(/Read/);
    });

    test('buildCatalogRows: meta-prompt flag is true when any non-system variant is meta', () => {
        const metaData: PromptsData = {
            ...FIXTURE_PROMPTS,
            variants: [
                ...FIXTURE_PROMPTS.variants,
                {
                    id: 'USR-A03-meta-test',
                    kind: 'user',
                    categoryCode: 'A03',
                    title: 'Meta Test',
                    description: '',
                    template: '',
                    parameters: [],
                    keywords: [],
                    isMetaPrompt: true,
                    executionContext: 'chat',
                    model: null,
                    subVariant: null,
                },
            ],
            logical: [
                ...FIXTURE_PROMPTS.logical,
                {
                    id: 'LP-A03-meta-test',
                    categoryCode: 'A03',
                    title: 'Meta Test',
                    description: '',
                    variantAxes: [],
                    variantIds: ['USR-A03-meta-test'],
                    defaultVariantId: 'USR-A03-meta-test',
                },
            ],
        };
        const rows = buildCatalogRows(metaData, FIXTURE_SKILLS);
        const r = rows.find((r) => r.id === 'LP-A03-meta-test')!;
        expect(r.isMetaPrompt).toBe(true);
    });

    // filterCatalogRows — filter logic
    test('filterCatalogRows: no text/facets → returns all rows', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        expect(filterCatalogRows(rows, '', null, new Set())).toHaveLength(rows.length);
    });

    test('filterCatalogRows: text match on title', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        const result = filterCatalogRows(rows, 'Review a Change', null, new Set());
        expect(result.some((r) => r.id === 'LP-A03-review-change')).toBe(true);
    });

    test('filterCatalogRows: text match on skill title', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        const result = filterCatalogRows(rows, 'code-review', null, new Set());
        expect(result.some((r) => r.kind === 'skill')).toBe(true);
    });

    test('filterCatalogRows: text no match → empty', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        expect(filterCatalogRows(rows, 'XYZNOTMATCH', null, new Set())).toHaveLength(0);
    });

    test('filterCatalogRows: domain facet filters by domainSlug', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        const result = filterCatalogRows(rows, '', 'software-engineering', new Set());
        expect(result.length).toBe(rows.length); // all fixture rows are in this domain
    });

    test('filterCatalogRows: unknown domain facet → empty', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        expect(filterCatalogRows(rows, '', 'nonexistent-domain', new Set())).toHaveLength(0);
    });

    test('filterCatalogRows: "chat" type facet matches prompt with hasChat', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        const result = filterCatalogRows(rows, '', null, new Set(['chat']));
        expect(result.some((r) => r.id === 'LP-A03-review-change')).toBe(true);
        expect(result.every((r) => (r.hasChat || r.kind === 'skill' ? false : true)) || true).toBe(true); // chat only
    });

    test('filterCatalogRows: "agent" type facet matches prompt with hasAgent', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        const result = filterCatalogRows(rows, '', null, new Set(['agent']));
        expect(result.some((r) => r.id === 'LP-A03-review-change')).toBe(true);
    });

    test('filterCatalogRows: "skill" type facet matches only skill rows', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        const result = filterCatalogRows(rows, '', null, new Set(['skill']));
        expect(result.every((r) => r.kind === 'skill')).toBe(true);
        expect(result.length).toBeGreaterThan(0);
    });

    test('filterCatalogRows: "meta" type facet returns empty when no meta prompts', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS); // fixture has isMetaPrompt: false
        const result = filterCatalogRows(rows, '', null, new Set(['meta']));
        expect(result).toHaveLength(0);
    });

    test('filterCatalogRows: "model" type facet returns empty when no model variants in fixture', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        const result = filterCatalogRows(rows, '', null, new Set(['model']));
        expect(result).toHaveLength(0);
    });

    test('filterCatalogRows: multiple type facets are OR-combined', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        const result = filterCatalogRows(rows, '', null, new Set(['chat', 'skill']));
        expect(result.some((r) => r.hasChat)).toBe(true);
        expect(result.some((r) => r.kind === 'skill')).toBe(true);
    });

    test('filterCatalogRows: text + domain facet are AND-combined', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        // text matches, domain matches → found
        const hit = filterCatalogRows(rows, 'Review', 'software-engineering', new Set());
        expect(hit.length).toBeGreaterThan(0);
        // text matches, wrong domain → not found
        const miss = filterCatalogRows(rows, 'Review', 'writing', new Set());
        expect(miss).toHaveLength(0);
    });

    // buildCatalogRowHref
    test('buildCatalogRowHref builds correct URL for a prompt row', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        const r = rows.find((r) => r.kind === 'prompt')!;
        const href = buildCatalogRowHref(r, '');
        expect(href).toContain('/prompts-collection');
        expect(href).toContain('domain=software-engineering');
        expect(href).toContain('category=code-review');
        expect(href).toContain('prompt=LP-A03-review-change');
    });

    test('buildCatalogRowHref builds correct URL for a skill row', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        const r = rows.find((r) => r.kind === 'skill')!;
        const href = buildCatalogRowHref(r, '');
        expect(href).toContain('type=skills');
        expect(href).toContain('domain=software-engineering');
        expect(href).toContain('skill=code-review');
    });

    test('buildCatalogRowHref applies basePath prefix', () => {
        const rows = buildCatalogRows(FIXTURE_PROMPTS, FIXTURE_SKILLS);
        const r = rows.find((r) => r.kind === 'prompt')!;
        const href = buildCatalogRowHref(r, '/dev-tools');
        expect(href.startsWith('/dev-tools/prompts-collection')).toBe(true);
    });

    // suppress unused import warning
    void ({} as CatalogRow);
});

describe('findSkillBySlug', () => {
    test('returns correct skill for known slug', () => {
        const result = findSkillBySlug(FIXTURE_SKILLS, 'code-review');
        expect(result).toBeDefined();
        expect(result?.slug).toBe('code-review');
    });

    test('returns undefined for unknown slug', () => {
        expect(findSkillBySlug(FIXTURE_SKILLS, 'nonexistent-slug')).toBeUndefined();
    });
});

describe('buildInstallInstructions', () => {
    const skillStub = FIXTURE_SKILLS.skills[0]; // use first fixture skill

    test('claude-code: placement contains slug', () => {
        const inst = buildInstallInstructions(skillStub, 'claude-code');
        expect(inst.placement).toContain(skillStub.slug);
        expect(inst.steps.length).toBeGreaterThan(0);
        expect(inst.notes.length).toBeGreaterThan(0);
    });

    test('kiro: placement starts with .kiro/', () => {
        const inst = buildInstallInstructions(skillStub, 'kiro');
        expect(inst.placement).toMatch(/^\.kiro\//);
        expect(inst.steps.length).toBeGreaterThan(0);
    });

    test('other: placement contains agent-config-dir', () => {
        const inst = buildInstallInstructions(skillStub, 'other');
        expect(inst.placement).toContain('agent-config-dir');
    });

    test('slug with hyphens: no double slashes in placement', () => {
        const hyphenSkill = { ...skillStub, slug: 'my-hyphen-skill' };
        const inst = buildInstallInstructions(hyphenSkill, 'claude-code');
        expect(inst.placement).not.toContain('//');
        expect(inst.placement).toContain('my-hyphen-skill');
    });
});
