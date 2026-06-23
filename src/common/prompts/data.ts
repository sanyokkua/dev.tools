import { loadCategory, loadManifest, loadSkill } from './loader';
import type { Manifest, SkillDef } from './model/types';
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
        const manifest = loadManifest();
        const categoryModules = await Promise.all(
            manifest.categories.map((cat) => loadCategory(cat.code).catch(() => ({ prompts: [] }))),
        );
        const allDefs = categoryModules.flatMap((m) => m.prompts);
        _prompts = {
            domains: manifest.domains as Domain[],
            categories: manifest.categories as Category[],
            logical: allDefs.map((lp) => ({
                id: lp.id,
                categoryCode: lp.categoryCode,
                title: lp.title,
                description: lp.description,
                variantAxes: lp.variantAxes as LogicalPrompt['variantAxes'],
                variantIds: lp.variants.map((v) => v.id),
                defaultVariantId: lp.defaultVariantId,
            })),
            variants: allDefs.flatMap((lp) => lp.variants) as unknown as PromptVariant[],
        };
    }
    return _prompts;
}

export async function loadSkillsData(): Promise<SkillsData> {
    if (!_skills) {
        const manifest = loadManifest();
        const skillDefs = await Promise.all(manifest.skills.map((s) => loadSkill(s.slug).catch(() => null)));
        _skills = { skills: skillDefs.filter(Boolean) as unknown as Skill[] };
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

export function buildCatalogRows(manifest: Manifest): CatalogRow[] {
    const rows: CatalogRow[] = [];
    const categoryMap = new Map(manifest.categories.map((c) => [c.code, c]));
    const domainMap = new Map(manifest.domains.map((d) => [d.code, d]));

    for (const lp of manifest.logical) {
        const category = categoryMap.get(lp.categoryCode);
        if (!category) continue;
        const domain = domainMap.get(lp.domainCode ?? category.domainCode);
        if (!domain) continue;

        let variantSummary = '—';
        if (lp.hasModel) {
            variantSummary = `${lp.modelCount} model${lp.modelCount !== 1 ? 's' : ''}`;
        } else if (lp.hasChat && lp.hasAgent) {
            variantSummary = 'chat · agent';
        } else if (lp.hasChat) {
            variantSummary = 'chat';
        } else if (lp.hasAgent) {
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
            isMetaPrompt: lp.isMetaPrompt,
            hasChat: lp.hasChat,
            hasAgent: lp.hasAgent,
            hasModel: lp.hasModel,
            modelCount: lp.modelCount,
            variantSummary,
        });
    }

    for (const skill of manifest.skills) {
        const domain = domainMap.get(skill.domainCode);
        const domainTitle = domain?.title ?? skill.domainCode;
        const domainSlug = domain?.slug ?? skill.domainCode;
        const tagList = skill.tags.slice(0, 3).join(' · ');
        const tagSuffix = skill.tags.length > 3 ? ' +…' : '';
        const variantSummary = skill.tags.length ? tagList + tagSuffix : '—';

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

export function findSkillBySlug(skills: SkillsData, slug: string): Skill | undefined {
    return skills.skills.find((s) => s.slug === slug);
}

export type InstallTarget = 'claude-code' | 'kiro' | 'other';
export interface InstallInstructions {
    placement: string;
    steps: string[];
    notes: string;
}

export function buildInstallInstructions(skill: SkillDef, target: InstallTarget): InstallInstructions {
    const slug = skill.slug;
    switch (target) {
        case 'claude-code':
            return {
                placement: `.claude/skills/${slug}/`,
                steps: [
                    `mkdir -p .claude/skills/${slug}`,
                    `# Paste SKILL.md content into .claude/skills/${slug}/SKILL.md`,
                    `# Or use the Download .zip button and extract there`,
                ],
                notes: 'Claude Code auto-discovers skills in .claude/skills/. No additional config needed.',
            };
        case 'kiro':
            return {
                placement: `.kiro/steering/`,
                steps: [`mkdir -p .kiro/steering`, `# Copy SKILL.md content to .kiro/steering/${slug}.md`],
                notes: 'Kiro loads steering files from .kiro/steering/ as persistent agent context.',
            };
        case 'other':
            return {
                placement: `<agent-config-dir>/${slug}/`,
                steps: [
                    `# Place SKILL.md in your agent's skill or rules directory`,
                    `# Refer to your agent's documentation for the exact path`,
                ],
                notes: "Each agent has its own convention for skill placement. Check your agent's docs.",
            };
    }
}
