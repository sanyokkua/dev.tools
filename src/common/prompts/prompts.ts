export enum PromptType {
    SYSTEM_PROMPT = 'system-prompt', // Core instructions for AI behavior
    USER_PROMPT_PARAMETRIZED = 'user-prompt-parametrized', // Variable-based prompts
    USER_PROMPT_PARAMETRIZED_CONVERSATION_FOCUSED = 'user-prompt-parametrized-conversation-focused',
}

export enum PromptCategory {
    CODE_GENERATION = 'code-generation', // Function/class generation
    CODE_REFACTORING = 'code-refactoring', // Readability/performance improvements
    CODE_REVIEW = 'code-review', // Quality assurance checks
    CODE_ANALYSIS = 'code-analysis', // Deep code inspection
    SECURITY_ANALYSIS = 'security-analysis', // Vulnerability detection
    DEBUGGING_ASSISTANCE = 'debugging-assistance', // Error diagnosis & fixes
    TEST_GENERATION = 'test-generation', // Unit/E2E tests creation
    CODE_DOCUMENTATION = 'code-documentation', // API/docs generation
    ARCHITECTURE_DESIGN = 'architecture-design', // System design guidance
    TECHNICAL_RESEARCH = 'technical-research', // Solution investigation
    CI_CD_PIPELINE = 'ci-cd-pipeline', // Deployment workflow creation
    FRONTEND_SPECIFIC = 'frontend-specific', // SPA component/state management
    API_DESIGN = 'api-design', // REST/GraphQL endpoint design
    MIGRATION_GUIDANCE = 'migration-guidance', // Framework/language transitions
    UX_IMPLEMENTATION = 'ux-implementation', // UI/UX code patterns
    INTERNATIONALIZATION = 'internationalization', // i18n implementation
    LEARNING_RESOURCES = 'learning-resources', // Tutorial recommendations
    MONITORING_SETUP = 'monitoring-setup', // Logging/observability configs
    IMAGE_PROMPT_GENERATION = 'image-prompt-generation',
    TEXT_PROOFREADING = 'text-proofreading',
    TEXT_FORMATTING = 'text-formatting',
    TEXT_TRANSLATION = 'text-translation',
    TASK_RESEARCH_PROMPT = 'task-research', // analyze the problem
    AGILE_USER_STORY_GENERATION = 'agile-user-story-generation',
}

export type Tags = string[];

export interface Prompt {
    id: string;
    type: PromptType;
    category: PromptCategory;
    tags: Tags;
    template: string;
    description: string;
    parameters?: string[];
}

export interface PromptParametrized extends Prompt {
    parameters: string[];
}
export type FilterQuery = { category?: string; promptType?: string; tag?: string; description?: string };

const DEFAULT_VALUE = 'All';
export const PromptTypes: string[] = [DEFAULT_VALUE, ...Object.values(PromptType)];
export const PromptCategories: string[] = [DEFAULT_VALUE, ...Object.values(PromptCategory)];

export function filterPrompts(promptsList: Prompt[], query: FilterQuery): Prompt[] {
    const { category = DEFAULT_VALUE, promptType = DEFAULT_VALUE, tag = '', description = '' } = query;
    const validTypes: string[] = Object.values(PromptType);
    const validCategories: string[] = Object.values(PromptCategory);

    return promptsList.filter((prompt) => {
        // Type filter
        const isTypeValid = promptType ? validTypes.includes(promptType) : false;
        const typeMatch = promptType === DEFAULT_VALUE || !isTypeValid || prompt.type === promptType;

        // Category filter
        const isCategoryValid = category ? validCategories.includes(category) : false;
        const categoryMatch = category === DEFAULT_VALUE || !isCategoryValid || prompt.category === category;

        // Tags filter (partial match)
        const tagsMatch = !tag || prompt.tags.some((tagItem) => tagItem.includes(tag));

        // Description filter (partial match)
        const descriptionMatch = !description || prompt.description.includes(description);

        return typeMatch && categoryMatch && tagsMatch && descriptionMatch;
    });
}

export function createSystemPrompt(
    id: string,
    promptText: string,
    category: PromptCategory,
    description: string,
    ...tags: string[]
): Prompt {
    return {
        id: id,
        type: PromptType.SYSTEM_PROMPT,
        category: category,
        tags: tags,
        template: promptText,
        description: description,
    };
}

export function extractParams(input: string): string[] {
    // Match {{param}} and capture "param"
    const regex = /\{\{(.*?)\}\}/g;
    const paramsSet = new Set<string>();

    for (const match of input.matchAll(regex)) {
        const paramName = match[1].trim();
        if (paramName) {
            paramsSet.add(paramName);
        }
    }

    return Array.from(paramsSet);
}

export function replaceParams(text: string, values: Record<string, string>): string {
    // Same pattern, global replace via callback
    return text.replace(/\{\{(.*?)\}\}/g, (_match, paramName) => {
        const key = paramName.trim();
        return values[key] ?? '';
    });
}

export function createUserParametrizedPrompt(
    id: string,
    promptText: string,
    category: PromptCategory,
    description: string,
    ...tags: string[]
): PromptParametrized {
    const params = extractParams(promptText);
    return {
        id: id,
        type: PromptType.USER_PROMPT_PARAMETRIZED,
        category: category,
        tags: tags,
        template: promptText,
        description: description,
        parameters: params,
    };
}

export function createUserParametrizedPromptForConversation(
    id: string,
    promptText: string,
    category: PromptCategory,
    description: string,
    ...tags: string[]
): PromptParametrized {
    const params = extractParams(promptText);
    return {
        id: id,
        type: PromptType.USER_PROMPT_PARAMETRIZED_CONVERSATION_FOCUSED,
        category: category,
        tags: tags,
        template: promptText,
        description: description,
        parameters: params,
    };
}

export function joinPromptLines(lines: string[] | undefined | null, useDash: boolean = true): string {
    if (!lines) {
        return '';
    }
    const mapperFunc = (line: string) => (useDash ? `  — ${line}` : `  ${line}`);
    return lines.map(mapperFunc).join('\n');
}
