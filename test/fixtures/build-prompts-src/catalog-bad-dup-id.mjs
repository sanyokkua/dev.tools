export const MODELS = [{ id: 'model-chat', label: 'Chat Model', slug: 'model-chat', modality: [] }];
export const STYLES = [{ id: 'formal', label: 'Formal', definition: 'Formal style.', rules: [] }];
export const TONES = [{ id: 'warm', label: 'Warm', definition: 'Warm tone.', rules: [] }];
export const CONTEXTS = [];
export const VALUE_SETS = [];
export const ABBREVIATIONS = {};
export const domains = [{ code: 'A', title: 'Software Engineering', description: 'SE.', slug: 'software-engineering' }];
export const categories = [
    {
        code: 'A01',
        domainCode: 'A',
        slug: 'code-generation',
        title: 'Code Generation',
        recommendedSystemPromptId: null,
    },
];
export const prompts = [
    {
        id: 'LP-A01-sql-query',
        categoryCode: 'A01',
        title: 'Generate a Query',
        description: 'First prompt.',
        variantAxes: [],
        defaultVariantId: 'VAR-A01-a',
        variants: [
            {
                id: 'VAR-A01-a',
                kind: 'user',
                categoryCode: 'A01',
                executionContext: 'chat',
                title: 'Generate a Query',
                description: 'First variant.',
                template: 'Write a query for: {{requirement}}',
                parameters: [{ name: 'requirement', label: 'Requirement', control: 'textarea' }],
                keywords: [],
                model: null,
                isMetaPrompt: false,
                recommendedSystemPromptId: null,
                relatedPromptIds: [],
                relatedSkillIds: [],
            },
        ],
    },
    {
        id: 'LP-A01-sql-query',
        categoryCode: 'A01',
        title: 'Generate a Query Again',
        description: 'Second prompt with duplicate id.',
        variantAxes: [],
        defaultVariantId: 'VAR-A01-b',
        variants: [
            {
                id: 'VAR-A01-b',
                kind: 'user',
                categoryCode: 'A01',
                executionContext: 'chat',
                title: 'Generate a Query Again',
                description: 'Second variant.',
                template: 'Write again for: {{requirement}}',
                parameters: [{ name: 'requirement', label: 'Requirement', control: 'textarea' }],
                keywords: [],
                model: null,
                isMetaPrompt: false,
                recommendedSystemPromptId: null,
                relatedPromptIds: [],
                relatedSkillIds: [],
            },
        ],
    },
];
export const skills = [];
