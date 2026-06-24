import type {
    Category,
    ContextOption,
    Domain,
    LogicalPromptDef,
    Manifest,
    ManifestLogical,
    ModelDef,
    Param,
    PromptVariant,
    RuleOption,
    SkillDef,
    SkillFile,
    ValueSet,
} from '@/common/prompts/model/types';

describe('model/types — interface shapes', () => {
    it('Domain accepts required fields', () => {
        const d: Domain = {
            code: 'A',
            title: 'Software Engineering',
            description: 'Desc',
            slug: 'software-engineering',
        };
        expect(d.code).toBe('A');
        expect(d.slug).toBe('software-engineering');
    });

    it('Category optional recommendedSystemPromptId is absent when not set', () => {
        const c: Category = { code: 'A01', domainCode: 'A', slug: 'code-generation', title: 'Code Generation' };
        expect(c.code).toBe('A01');
        expect(c.recommendedSystemPromptId).toBeUndefined();
    });

    it('Param requires control field; optional fields absent when not provided', () => {
        const p: Param = { name: 'language', control: 'combobox', allowCustom: true };
        expect(p.control).toBe('combobox');
        expect(p.label).toBeUndefined();
        expect(p.valueSetId).toBeUndefined();
        expect(p.placeholder).toBeUndefined();
    });

    it('Param accepts all optional fields', () => {
        const p: Param = {
            name: 'requirement',
            label: 'Requirement',
            description: 'What to build',
            control: 'textarea',
            valueSetId: 'output-format',
            suggestedValues: ['a', 'b'],
            allowCustom: true,
            optional: false,
            placeholder: 'Describe here…',
        };
        expect(p.control).toBe('textarea');
        expect(p.label).toBe('Requirement');
        expect(p.placeholder).toBe('Describe here…');
    });

    it('Param control variants are all valid', () => {
        const controls = ['textarea', 'text', 'select', 'combobox'] as const;
        controls.forEach((control) => {
            const p: Param = { name: 'x', control };
            expect(p.control).toBe(control);
        });
    });

    it('PromptVariant requires executionContext (Mode)', () => {
        const v: PromptVariant = {
            id: 'USR-A01-test',
            kind: 'user',
            categoryCode: 'A01',
            title: 'Test Prompt',
            description: '',
            template: 'Hello {{name}}',
            parameters: [{ name: 'name', control: 'text' }],
            keywords: ['test'],
            executionContext: 'chat',
        };
        expect(v.executionContext).toBe('chat');
        expect(v.supports).toBeUndefined();
    });

    it('PromptVariant supports field captures style/tone/context flags', () => {
        const v: PromptVariant = {
            id: 'USR-B04-rewrite',
            kind: 'user',
            categoryCode: 'B04',
            title: 'Rewrite',
            description: '',
            template: '{{user_text}}',
            parameters: [{ name: 'user_text', control: 'textarea' }],
            keywords: [],
            executionContext: 'chat',
            supports: { style: true, tone: true, context: true },
        };
        expect(v.supports?.style).toBe(true);
        expect(v.supports?.tone).toBe(true);
        expect(v.supports?.context).toBe(true);
    });

    it('LogicalPromptDef has inlined variants array and optional modeClass', () => {
        const variant: PromptVariant = {
            id: 'USR-A01-sql',
            kind: 'user',
            categoryCode: 'A01',
            title: 'Generate a SQL Query',
            description: '',
            template: '{{requirement}}',
            parameters: [{ name: 'requirement', control: 'textarea' }],
            keywords: ['sql'],
            executionContext: 'chat',
        };
        const lp: LogicalPromptDef = {
            id: 'LP-A01-sql',
            categoryCode: 'A01',
            title: 'Generate a SQL Query',
            description: 'Generates SQL from requirements',
            variantAxes: ['mode'],
            variants: [variant],
            defaultVariantId: 'USR-A01-sql',
            modeClass: 'dual',
        };
        expect(lp.variants).toHaveLength(1);
        expect(lp.modeClass).toBe('dual');
        expect(lp.subtitle).toBeUndefined();
    });

    it('LogicalPromptDef modeClass covers all four values', () => {
        const base = {
            id: 'LP-X',
            categoryCode: 'A01',
            title: 'T',
            description: '',
            variantAxes: [] as const,
            variants: [],
            defaultVariantId: 'x',
        } satisfies Omit<LogicalPromptDef, 'modeClass'>;

        const classes = ['chat-only', 'chat-only-meta', 'dual', 'agent-only'] as const;
        classes.forEach((modeClass) => {
            const lp: LogicalPromptDef = { ...base, modeClass };
            expect(lp.modeClass).toBe(modeClass);
        });
    });

    it('SkillFile accepts all four roles', () => {
        const roles = ['skill', 'reference', 'script', 'asset'] as const;
        roles.forEach((role) => {
            const sf: SkillFile = { path: 'file.md', role, content: '…' };
            expect(sf.role).toBe(role);
        });
    });

    it('SkillDef has optional scripts and install fields', () => {
        const skill: SkillDef = {
            id: 'SKILL-code-review',
            slug: 'code-review',
            domainCode: 'A',
            title: 'Code Review',
            version: '1.0.0',
            description: 'Reviews code changes',
            tags: ['code-review'],
            allowedTools: ['Read', 'Grep'],
            relatedSkillIds: [],
            files: [{ path: 'SKILL.md', role: 'skill', content: '# CR' }],
            scripts: [{ name: 'get-review-target.sh', purpose: 'compute diff scope' }],
            install: { defaultLocation: '.claude/skills/code-review/', supportsProject: true, supportsGlobal: true },
        };
        expect(skill.scripts).toHaveLength(1);
        expect(skill.scripts?.[0].name).toBe('get-review-target.sh');
        expect(skill.install?.defaultLocation).toBe('.claude/skills/code-review/');
        expect(skill.install?.supportsProject).toBe(true);
    });

    it('SkillDef scripts and install are absent when not provided', () => {
        const skill: SkillDef = {
            id: 'SKILL-basic',
            slug: 'basic',
            domainCode: 'A',
            title: 'Basic',
            version: '1.0.0',
            description: '',
            tags: [],
            allowedTools: [],
            relatedSkillIds: [],
            files: [],
        };
        expect(skill.scripts).toBeUndefined();
        expect(skill.install).toBeUndefined();
    });

    it('ModelDef has modality array and optional defaults', () => {
        const m: ModelDef = { id: 'flux-2', label: 'FLUX.2', slug: 'flux-2', modality: ['image-gen'] };
        expect(m.modality).toContain('image-gen');
        expect(m.defaults).toBeUndefined();
    });

    it('ModelDef accepts multiple modalities and defaults record', () => {
        const m: ModelDef = {
            id: 'gpt-image',
            label: 'GPT Image',
            slug: 'gpt-image',
            modality: ['image-gen', 'image-edit'],
            defaults: { cfg: '6-8', steps: '25-40' },
        };
        expect(m.modality).toHaveLength(2);
        expect(m.defaults?.cfg).toBe('6-8');
    });

    it('RuleOption has required rules array; optional do/dont/example fields absent', () => {
        const r: RuleOption = {
            id: 'formal',
            label: 'Formal',
            definition: 'Adherent to conventions',
            rules: ['Use complete sentences.', 'Avoid contractions.'],
        };
        expect(r.rules).toHaveLength(2);
        expect(r.do).toBeUndefined();
        expect(r.dont).toBeUndefined();
        expect(r.exampleBefore).toBeUndefined();
    });

    it('ContextOption references styleId/toneId and has structure array', () => {
        const c: ContextOption = {
            id: 'reply-to-landlord',
            label: 'Reply to a landlord',
            group: 'everyday',
            styleId: 'formal',
            toneId: 'assertive',
            structure: ['Open with the core issue.', 'Cite the clause.'],
        };
        expect(c.styleId).toBe('formal');
        expect(c.toneId).toBe('assertive');
        expect(c.structure).toHaveLength(2);
        expect(c.group).toBe('everyday');
    });

    it('ContextOption group covers all three values', () => {
        const groups = ['it-work', 'everyday', 'edge-case'] as const;
        groups.forEach((group) => {
            const c: ContextOption = {
                id: `ctx-${group}`,
                label: group,
                group,
                styleId: 's',
                toneId: 't',
                structure: [],
            };
            expect(c.group).toBe(group);
        });
    });

    it('ValueSet has values array and allowCustom flag', () => {
        const vs: ValueSet = {
            id: 'programming-language',
            label: 'Programming language',
            values: ['Java', 'TypeScript', 'Python'],
            allowCustom: true,
        };
        expect(vs.values).toContain('TypeScript');
        expect(vs.allowCustom).toBe(true);
    });

    it('ManifestLogical has variant-axis boolean flags', () => {
        const ml: ManifestLogical = {
            id: 'LP-A01-sql',
            categoryCode: 'A01',
            domainCode: 'A',
            title: 'Generate a SQL Query',
            description: '',
            tags: ['sql'],
            variantAxes: ['mode'],
            hasChat: true,
            hasAgent: true,
            hasModel: false,
            modelCount: 0,
            isMetaPrompt: false,
            keywords: ['sql', 'query'],
        };
        expect(ml.hasChat).toBe(true);
        expect(ml.hasAgent).toBe(true);
        expect(ml.hasModel).toBe(false);
        expect(ml.subtitle).toBeUndefined();
    });

    it('Manifest aggregates all top-level collections', () => {
        const m: Manifest = {
            domains: [{ code: 'A', title: 'Software Engineering', description: '', slug: 'software-engineering' }],
            categories: [{ code: 'A01', domainCode: 'A', slug: 'code-generation', title: 'Code Generation' }],
            logical: [],
            skills: [],
        };
        expect(m.domains).toHaveLength(1);
        expect(m.categories).toHaveLength(1);
        expect(m.logical).toHaveLength(0);
        expect(m.skills).toHaveLength(0);
    });

    it('Manifest skill entry has all required fields', () => {
        const m: Manifest = {
            domains: [],
            categories: [],
            logical: [],
            skills: [
                {
                    id: 'SKILL-code-review',
                    slug: 'code-review',
                    domainCode: 'A',
                    title: 'Code Review',
                    version: '1.0.0',
                    description: 'Reviews code',
                    tags: ['code-review'],
                    fileCount: 3,
                },
            ],
        };
        expect(m.skills[0].fileCount).toBe(3);
    });
});
