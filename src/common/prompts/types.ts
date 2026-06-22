export type DomainCode = string;

export interface Domain {
    code: DomainCode;
    title: string;
    description: string;
    slug: string;
}

export interface Category {
    code: string;
    domainCode: DomainCode;
    slug: string;
    title: string;
    recommendedSystemPromptId?: string | null;
}

export interface Param {
    name: string;
    label?: string;
    control?: 'textarea' | 'text' | 'select' | 'combobox';
    valueSetId?: string;
    description?: string;
    suggestedValues?: string[];
    allowCustom?: boolean;
    optional?: boolean;
}

export interface PromptVariant {
    id: string;
    kind: 'system' | 'user' | 'agent';
    categoryCode: string;
    title: string;
    description: string;
    template: string;
    parameters: Param[];
    examples?: Record<string, string[]>;
    notes?: string;
    keywords: string[];
    model?: string | null;
    executionContext?: 'chat' | 'agent';
    subVariant?: string | null;
    isMetaPrompt?: boolean;
    recommendedSystemPromptId?: string | null;
    relatedPromptIds?: string[];
    relatedSkillIds?: string[];
}

export interface LogicalPrompt {
    id: string;
    categoryCode: string;
    title: string;
    description: string;
    variantAxes: ('model' | 'executionContext' | 'subVariant')[];
    variantIds: string[];
    defaultVariantId: string;
}

export interface SkillFile {
    path: string;
    role: 'skill' | 'reference' | 'script' | 'asset';
    content: string;
    bytes?: number;
}

export interface Skill {
    id: string;
    slug: string;
    domainCode: DomainCode;
    title: string;
    version: string;
    description: string;
    tags: string[];
    allowedTools: string[];
    relatedSkillIds: string[];
    files: SkillFile[];
}

export interface PromptsData {
    domains: Domain[];
    categories: Category[];
    logical: LogicalPrompt[];
    variants: PromptVariant[];
}

export interface SkillsData {
    skills: Skill[];
}

export interface CatalogRow {
    id: string;
    kind: 'prompt' | 'skill';
    title: string;
    domainCode: string;
    domainSlug: string;
    domainTitle: string;
    categorySlug: string | null;
    categoryTitle: string;
    isMetaPrompt: boolean;
    hasChat: boolean;
    hasAgent: boolean;
    hasModel: boolean;
    modelCount: number;
    variantSummary: string;
}
