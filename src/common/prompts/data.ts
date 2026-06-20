import type {
    CatalogRow,
    Category,
    Domain,
    LogicalPrompt,
    PromptVariant,
    PromptsData,
    Skill,
    SkillsData,
} from './types';

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

export function selectVariant(
    variants: PromptVariant[],
    context?: 'chat' | 'agent' | null,
    model?: string | null,
    sub?: string | null,
): PromptVariant | undefined {
    if (!variants.length) return undefined;
    let candidates = variants;

    if (context != null && candidates.some((v) => v.executionContext != null)) {
        const filtered = candidates.filter((v) => v.executionContext === context);
        if (filtered.length) candidates = filtered;
    }
    if (model != null && candidates.some((v) => v.model != null)) {
        const filtered = candidates.filter((v) => v.model === model);
        if (filtered.length) candidates = filtered;
    }
    if (sub != null && candidates.some((v) => v.subVariant != null)) {
        const filtered = candidates.filter((v) => v.subVariant === sub);
        if (filtered.length) candidates = filtered;
    }
    return candidates[0];
}

export function buildSysPromptHref(
    sysPromptId: string,
    domainSlug: string,
    categorySlug: string,
    basePath = '',
): string {
    const params = new URLSearchParams({ domain: domainSlug, category: categorySlug, prompt: sysPromptId });
    return `${basePath}/prompts-collection?${params.toString()}`;
}

export function buildCatalogRows(data: PromptsData, skills: SkillsData): CatalogRow[] {
    const rows: CatalogRow[] = [];

    for (const lp of data.logical) {
        const category = data.categories.find((c) => c.code === lp.categoryCode);
        if (!category) continue;
        const domain = data.domains.find((d) => d.code === category.domainCode);
        if (!domain) continue;

        const lpVariants = variantsOf(data, lp.id).filter((v) => v.kind !== 'system');
        const isMetaPrompt = lpVariants.some((v) => v.isMetaPrompt);
        const hasChat = lpVariants.some((v) => v.executionContext === 'chat');
        const hasAgent = lpVariants.some((v) => v.executionContext === 'agent');
        const hasModel = lp.variantAxes.includes('model');
        const modelCount = hasModel ? new Set(lpVariants.map((v) => v.model).filter(Boolean)).size : 0;

        let variantSummary = '—';
        if (hasModel) {
            variantSummary = `${modelCount} model${modelCount !== 1 ? 's' : ''}`;
        } else if (hasChat && hasAgent) {
            variantSummary = 'chat · agent';
        } else if (hasChat) {
            variantSummary = 'chat';
        } else if (hasAgent) {
            variantSummary = 'agent';
        }

        rows.push({
            id: lp.id,
            kind: 'prompt',
            title: lp.title,
            domainCode: domain.code,
            domainSlug: domain.slug,
            domainTitle: domain.title,
            categorySlug: category.slug,
            categoryTitle: category.title,
            isMetaPrompt,
            hasChat,
            hasAgent,
            hasModel,
            modelCount,
            variantSummary,
        });
    }

    for (const skill of skills.skills) {
        const domain = data.domains.find((d) => d.code === skill.domainCode);
        const domainTitle = domain?.title ?? skill.domainCode;
        const domainSlug = domain?.slug ?? skill.domainCode;
        const toolList = skill.allowedTools.slice(0, 3).join(' · ');
        const toolSuffix = skill.allowedTools.length > 3 ? ' +…' : '';
        const variantSummary = skill.allowedTools.length ? toolList + toolSuffix : '—';

        rows.push({
            id: skill.slug,
            kind: 'skill',
            title: skill.title,
            domainCode: skill.domainCode,
            domainSlug,
            domainTitle,
            categorySlug: null,
            categoryTitle: 'Skills',
            isMetaPrompt: false,
            hasChat: false,
            hasAgent: false,
            hasModel: false,
            modelCount: 0,
            variantSummary,
        });
    }

    return rows;
}

export function filterCatalogRows(
    rows: CatalogRow[],
    text: string,
    domainFacet: string | null,
    typeFacets: ReadonlySet<string>,
): CatalogRow[] {
    let result = rows;

    if (text.trim()) {
        const q = text.toLowerCase();
        result = result.filter(
            (r) =>
                r.title.toLowerCase().includes(q) ||
                r.domainTitle.toLowerCase().includes(q) ||
                r.categoryTitle.toLowerCase().includes(q) ||
                r.variantSummary.toLowerCase().includes(q),
        );
    }

    if (domainFacet) {
        result = result.filter((r) => r.domainSlug === domainFacet);
    }

    if (typeFacets.size > 0) {
        result = result.filter((r) => {
            if (typeFacets.has('chat') && r.hasChat) return true;
            if (typeFacets.has('agent') && r.hasAgent) return true;
            if (typeFacets.has('model') && r.hasModel) return true;
            if (typeFacets.has('meta') && r.isMetaPrompt) return true;
            if (typeFacets.has('skill') && r.kind === 'skill') return true;
            return false;
        });
    }

    return result;
}

export function buildCatalogRowHref(row: CatalogRow, basePath = ''): string {
    if (row.kind === 'skill') {
        const p = new URLSearchParams({ type: 'skills', domain: row.domainSlug, skill: row.id });
        return `${basePath}/prompts-collection?${p.toString()}`;
    }
    const params: Record<string, string> = { domain: row.domainSlug, prompt: row.id };
    if (row.categorySlug) params['category'] = row.categorySlug;
    return `${basePath}/prompts-collection?${new URLSearchParams(params).toString()}`;
}
