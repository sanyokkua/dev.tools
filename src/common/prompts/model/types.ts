// Extended data-model contract for the new TS-module pipeline.
// Old src/common/prompts/types.ts stays unchanged until T10.

// ─── Primitive type aliases ────────────────────────────────────────────────

export type DomainCode = string;
export type Kind = 'system' | 'user' | 'agent';
export type Mode = 'chat' | 'agent';
export type ParamControl = 'textarea' | 'text' | 'select' | 'combobox';
export type VariantAxis = 'mode' | 'model' | 'subVariant';
export type SkillFileRole = 'skill' | 'reference' | 'script' | 'asset';
export type Modality = 'image-gen' | 'image-edit' | 'video';

// ─── Taxonomy ─────────────────────────────────────────────────────────────

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

// ─── Prompt types ─────────────────────────────────────────────────────────

export interface Param {
    name: string;
    label?: string;
    description?: string;
    control: ParamControl;
    valueSetId?: string;
    suggestedValues?: string[];
    allowCustom?: boolean;
    optional?: boolean;
    placeholder?: string;
}

export interface PromptVariant {
    id: string;
    kind: Kind;
    categoryCode: string;
    title: string;
    description: string;
    template: string;
    parameters: Param[];
    examples?: Record<string, string[]>;
    notes?: string;
    keywords: string[];
    model?: string | null;
    executionContext: Mode;
    subVariant?: string | null;
    isMetaPrompt?: boolean;
    recommendedSystemPromptId?: string | null;
    relatedPromptIds?: string[];
    relatedSkillIds?: string[];
    supports?: { style?: boolean; tone?: boolean; context?: boolean };
}

export interface LogicalPromptDef {
    id: string;
    categoryCode: string;
    title: string;
    subtitle?: string;
    description: string;
    variantAxes: VariantAxis[];
    variants: PromptVariant[];
    defaultVariantId: string;
    modeClass?: 'chat-only' | 'chat-only-meta' | 'dual' | 'agent-only';
}

// ─── Skill types ──────────────────────────────────────────────────────────

export interface SkillFile {
    path: string;
    role: SkillFileRole;
    content: string;
    bytes?: number;
}

export interface SkillDef {
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
    scripts?: { name: string; purpose: string }[];
    install?: { defaultLocation: string; supportsProject: boolean; supportsGlobal: boolean };
}

// ─── Registry types ───────────────────────────────────────────────────────

export interface ModelDef {
    id: string;
    label: string;
    slug: string;
    modality: Modality[];
    defaults?: Record<string, string>;
}

export interface RuleOption {
    id: string;
    label: string;
    definition: string;
    rules: string[];
    do?: string[];
    dont?: string[];
    exampleBefore?: string;
    exampleAfter?: string;
}

export interface ContextOption {
    id: string;
    label: string;
    group: 'it-work' | 'everyday' | 'edge-case';
    relationship?: string;
    channel?: string;
    styleId: string;
    toneId: string;
    formality?: string;
    structure: string[];
    extraRules?: string[];
    exampleBefore?: string;
    exampleAfter?: string;
}

export interface ValueSet {
    id: string;
    label: string;
    values: string[];
    allowCustom: boolean;
}

// ─── Manifest types (interfaces for the generated manifest; used by loader.ts) ──

export interface ManifestLogical {
    id: string;
    categoryCode: string;
    domainCode: string;
    title: string;
    subtitle?: string;
    description: string;
    tags: string[];
    variantAxes: VariantAxis[];
    hasChat: boolean;
    hasAgent: boolean;
    hasModel: boolean;
    modelCount: number;
    modeClass?: string;
    isMetaPrompt: boolean;
    keywords: string[];
}

export interface ManifestSkill {
    id: string;
    slug: string;
    domainCode: string;
    title: string;
    version: string;
    description: string;
    tags: string[];
    fileCount: number;
}

export interface Manifest {
    domains: Domain[];
    categories: Category[];
    logical: ManifestLogical[];
    skills: ManifestSkill[];
}
