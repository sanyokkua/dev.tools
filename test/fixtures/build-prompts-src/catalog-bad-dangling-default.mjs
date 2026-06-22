export const MODELS = [];
export const STYLES = [];
export const TONES = [];
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
        description: 'A prompt.',
        variantAxes: [],
        defaultVariantId: 'DOES-NOT-EXIST',
        variants: [
            {
                id: 'VAR-A01-a',
                kind: 'user',
                categoryCode: 'A01',
                executionContext: 'chat',
                title: 'Generate a Query',
                description: 'A variant.',
                template: 'Write for: {{requirement}}',
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
