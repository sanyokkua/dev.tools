import type { Category, Domain, LogicalPrompt, PromptVariant, PromptsData, Skill, SkillsData } from './types';

let _prompts: PromptsData | null = null;
let _skills: SkillsData | null = null;

export async function loadPromptsData(): Promise<PromptsData> {
    if (!_prompts) {
        const mod = await import('./generated/prompts-data.json');
        _prompts = mod.default as unknown as PromptsData;
    }
    return _prompts;
}

export async function loadSkillsData(): Promise<SkillsData> {
    if (!_skills) {
        const mod = await import('./generated/skills-data.json');
        _skills = mod.default as unknown as SkillsData;
    }
    return _skills;
}

export function listDomains(data: PromptsData): Domain[] {
    return data.domains;
}

export function categoriesByDomain(data: PromptsData, domainCode: string): Category[] {
    return data.categories.filter((c) => c.domainCode === domainCode);
}

export function logicalByCategory(data: PromptsData, categoryCode: string): LogicalPrompt[] {
    return data.logical.filter((lp) => lp.categoryCode === categoryCode);
}

export function variantsOf(data: PromptsData, logicalId: string): PromptVariant[] {
    const lp = data.logical.find((l) => l.id === logicalId);
    if (!lp) return [];
    return lp.variantIds.map((id) => data.variants.find((v) => v.id === id)).filter(Boolean) as PromptVariant[];
}

export function defaultVariant(data: PromptsData, logicalId: string): PromptVariant | undefined {
    const lp = data.logical.find((l) => l.id === logicalId);
    if (!lp) return undefined;
    return data.variants.find((v) => v.id === lp.defaultVariantId);
}

export function findVariantById(data: PromptsData, id: string): PromptVariant | undefined {
    return data.variants.find((v) => v.id === id);
}

export function recommendedSystemPromptFor(data: PromptsData, categoryCode: string): PromptVariant | undefined {
    const cat = data.categories.find((c) => c.code === categoryCode);
    if (!cat?.recommendedSystemPromptId) return undefined;
    return data.variants.find((v) => v.id === cat.recommendedSystemPromptId);
}

export function relatedOf(data: PromptsData, variant: PromptVariant): PromptVariant[] {
    return (variant.relatedPromptIds ?? [])
        .map((id) => data.variants.find((v) => v.id === id))
        .filter(Boolean) as PromptVariant[];
}

export function skillsByDomain(skills: SkillsData, domainCode: string): Skill[] {
    return skills.skills.filter((s) => s.domainCode === domainCode);
}

export function searchAll(
    data: PromptsData,
    skills: SkillsData,
    query: string,
): Array<{ type: 'prompt' | 'skill'; item: PromptVariant | Skill }> {
    const q = query.toLowerCase();
    const promptResults = data.variants
        .filter((v) => v.kind !== 'system')
        .filter(
            (v) =>
                v.title.toLowerCase().includes(q) ||
                v.description.toLowerCase().includes(q) ||
                v.keywords.some((k) => k.toLowerCase().includes(q)) ||
                v.categoryCode.toLowerCase().includes(q),
        )
        .map((item) => ({ type: 'prompt' as const, item }));
    const skillResults = skills.skills
        .filter(
            (s) =>
                s.title.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q) ||
                s.tags.some((t) => t.toLowerCase().includes(q)),
        )
        .map((item) => ({ type: 'skill' as const, item }));
    return [...promptResults, ...skillResults];
}

export function replaceParams(template: string, values: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? `{{${key}}}`);
}
