import {
    createSystemPrompt,
    createUserParametrizedPrompt,
    extractParams,
    filterPrompts,
    joinPromptLines,
    Prompt,
    PromptCategory,
    PromptType,
    replaceParams,
} from '@/common/prompts/prompts';

describe('filterPrompts', () => {
    const mockPromptsList: Prompt[] = [
        {
            id: '1',
            type: PromptType.SYSTEM_PROMPT,
            category: PromptCategory.API_DESIGN,
            tags: ['tag1'],
            template: 'You are a test 1',
            description: 'Testing Prompt 1',
        },
        {
            id: '2',
            type: PromptType.SYSTEM_PROMPT,
            category: PromptCategory.IMAGE_PROMPT_GENERATION,
            tags: ['tag2'],
            template: 'You are a test 2',
            description: 'Prompt for testing',
        },
        {
            id: '3',
            type: PromptType.USER_PROMPT_PARAMETRIZED,
            category: PromptCategory.CODE_ANALYSIS,
            tags: ['tag1', 'tag2'],
            template: 'Template for user',
            description: '',
        },
        {
            id: '4',
            type: PromptType.USER_PROMPT_PARAMETRIZED,
            category: PromptCategory.API_DESIGN,
            tags: ['tag3', 'tag4'],
            template: 'parametrized example',
            description: 'Param',
        },
    ];

    test('returns all prompts when no filters are applied', () => {
        expect(filterPrompts(mockPromptsList, {})).toHaveLength(4);
    });

    test('ignores invalid filters', () => {
        expect(filterPrompts(mockPromptsList, { promptType: 'invalid', category: 'invalid' })).toHaveLength(4);
    });

    test('filters by promptType correctly', () => {
        const result = filterPrompts(mockPromptsList, { promptType: PromptType.SYSTEM_PROMPT });
        expect(result.every((p) => p.type === PromptType.SYSTEM_PROMPT)).toBe(true);
        expect(result).toHaveLength(2);
    });

    test('filters by category correctly', () => {
        const result = filterPrompts(mockPromptsList, { category: PromptCategory.API_DESIGN });
        expect(result.every((p) => p.category === PromptCategory.API_DESIGN)).toBe(true);
        expect(result).toHaveLength(2);
    });

    test('filters by exact tag match', () => {
        const result = filterPrompts(mockPromptsList, { tag: 'tag1' });
        expect(result.every((p) => p.tags.includes('tag1'))).toBe(true);
        expect(result).toHaveLength(2);
    });

    test('filters by partial tag match', () => {
        const result = filterPrompts(mockPromptsList, { tag: 'ag2' });
        expect(result.every((p) => p.tags.some((t) => t.includes('ag2')))).toBe(true);
        expect(result).toHaveLength(2);
    });

    test('filters by description partial match', () => {
        const result = filterPrompts(mockPromptsList, { description: 'Prompt' });
        expect(result.every((p) => p.description.includes('Prompt'))).toBe(true);
        expect(result).toHaveLength(2);
    });

    test('combined filtering', () => {
        const result = filterPrompts(mockPromptsList, {
            promptType: PromptType.SYSTEM_PROMPT,
            category: PromptCategory.IMAGE_PROMPT_GENERATION,
            tag: 'tag2',
            description: 'testing',
        });
        expect(result).toHaveLength(1);
        const [item] = result;
        expect(item.type).toBe(PromptType.SYSTEM_PROMPT);
        expect(item.category).toBe(PromptCategory.IMAGE_PROMPT_GENERATION);
        expect(item.tags).toContain('tag2');
        expect(item.description).toBe('Prompt for testing');
    });
});

describe('createSystemPrompt', () => {
    test('creates a valid system prompt object', () => {
        const prompt = createSystemPrompt(
            '1',
            'Test system',
            PromptCategory.SECURITY_ANALYSIS,
            'Security check',
            'sec',
            'analysis',
        );
        expect(prompt).toEqual({
            id: '1',
            type: PromptType.SYSTEM_PROMPT,
            category: PromptCategory.SECURITY_ANALYSIS,
            tags: ['sec', 'analysis'],
            template: 'Test system',
            description: 'Security check',
        });
    });
});

describe('extractParams', () => {
    test('extracts single parameter', () => {
        expect(extractParams('Hello {{name}}!')).toEqual(['name']);
    });

    test('extracts multiple parameters and removes duplicates', () => {
        const input = 'A {{one}}, B {{two}}, C {{one}}';
        const result = extractParams(input).sort();
        expect(result).toEqual(['one', 'two']);
    });

    test('ignores empty braces and whitespace', () => {
        expect(extractParams('Empty {{  }} and {{ val }}')).toEqual(['val']);
    });

    test('returns empty array when no params', () => {
        expect(extractParams('No parameters here')).toEqual([]);
    });
});

describe('replaceParams', () => {
    const template = 'User: {{ user }}, Role: {{role}}';

    test('replaces parameters with given values', () => {
        const result = replaceParams(template, { user: 'Alice', role: 'Admin' });
        expect(result).toBe('User: Alice, Role: Admin');
    });

    test('replaces missing values with empty string', () => {
        const result = replaceParams(template, { user: 'Bob' });
        expect(result).toBe('User: Bob, Role: ');
    });

    test('handles multiple occurrences', () => {
        const t = '{{x}} and {{x}}';
        expect(replaceParams(t, { x: 'repeat' })).toBe('repeat and repeat');
    });
});

describe('createUserParametrizedPrompt', () => {
    test('creates parametrized prompt with parameters field', () => {
        const input = 'Run {{ cmd }} on {{ target }}';
        const prompt = createUserParametrizedPrompt(
            '2',
            input,
            PromptCategory.CI_CD_PIPELINE,
            'CI/CD execution',
            'ci',
            'pipeline',
        );
        expect(prompt.id).toBe('2');
        expect(prompt.type).toBe(PromptType.USER_PROMPT_PARAMETRIZED);
        expect(prompt.parameters.sort()).toEqual(['cmd', 'target']);
        expect(prompt.template).toBe(input);
        expect(prompt.tags).toEqual(['ci', 'pipeline']);
        expect(prompt.description).toBe('CI/CD execution');
    });
});

describe('joinPromptLines', () => {
    const lines = ['first', 'second'];

    test('joins with dashes by default', () => {
        const joined = joinPromptLines(lines);
        expect(joined).toBe('  — first\n  — second');
    });

    test('joins without dashes when useDash=false', () => {
        const joined = joinPromptLines(lines, false);
        expect(joined).toBe('  first\n  second');
    });

    test('returns empty string for null or undefined', () => {
        expect(joinPromptLines(null)).toBe('');
        expect(joinPromptLines(undefined)).toBe('');
    });

    test('returns empty string for empty array', () => {
        expect(joinPromptLines([])).toBe('');
    });
});
