export const MODELS = [
    { id: 'model-chat', label: 'Chat Model', slug: 'model-chat', modality: [] },
    { id: 'model-image', label: 'Image Model', slug: 'model-image', modality: ['image-gen'] },
];
export const STYLES = [{ id: 'formal', label: 'Formal', definition: 'Formal style.', rules: [] }];
export const TONES = [{ id: 'warm', label: 'Warm', definition: 'Warm tone.', rules: [] }];
export const CONTEXTS = [
    { id: 'ctx-work', label: 'Work', group: 'it-work', styleId: 'formal', toneId: 'warm', structure: [] },
];
export const VALUE_SETS = [
    { id: 'sql-dialect', label: 'SQL Dialect', values: ['MySQL', 'PostgreSQL'], allowCustom: true },
];
export const ABBREVIATIONS = {
    PR: 'Pull Request (PR)',
    SQL: 'Structured Query Language (SQL)',
    API: 'Application Programming Interface (API)',
};
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
        title: 'Generate a SQL Query',
        description: 'Generates SQL queries from natural language requirements.',
        variantAxes: ['mode'],
        defaultVariantId: 'USR-A01-sql-query',
        modeClass: 'chat-only',
        variants: [
            {
                id: 'USR-A01-sql-query',
                kind: 'user',
                categoryCode: 'A01',
                executionContext: 'chat',
                title: 'Generate a SQL Query',
                description: 'Chat variant for SQL generation.',
                template: 'Write a {{dialect}} query for: {{requirement}}',
                parameters: [
                    {
                        name: 'dialect',
                        label: 'SQL Dialect',
                        control: 'combobox',
                        valueSetId: 'sql-dialect',
                        allowCustom: true,
                    },
                    { name: 'requirement', label: 'Requirement', control: 'textarea' },
                ],
                keywords: ['sql', 'query'],
                model: null,
                isMetaPrompt: false,
                recommendedSystemPromptId: null,
                relatedPromptIds: [],
                relatedSkillIds: ['SKILL-code-review'],
            },
        ],
    },
];
export const skills = [
    {
        id: 'SKILL-code-review',
        slug: 'code-review',
        domainCode: 'A',
        title: 'Code Review',
        version: '1.0.0',
        description: 'Reviews code for correctness and style.',
        tags: ['code', 'review'],
        allowedTools: ['Read', 'Grep'],
        relatedSkillIds: [],
        files: [{ path: 'SKILL.md', role: 'skill', content: '# Code Review', bytes: 13 }],
    },
];
