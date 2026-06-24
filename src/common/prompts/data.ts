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
            domains: manifest.domains,
            categories: manifest.categories,
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
            variantSummary = `${lp.modelCount} model${lp.modelCount === 1 ? '' : 's'}`;
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

export type InstallScope = 'project' | 'user-global';
export type InstallTarget =
    | 'claude-code'
    | 'github-copilot'
    | 'opencode'
    | 'amazon-kiro'
    | 'openai-codex'
    | 'jetbrains-junie';
export interface InstallInstructions {
    placement: string;
    steps: string[];
    notes: string;
    copyablePrompt: string;
}

export function buildInstallInstructions(
    skill: SkillDef,
    target: InstallTarget,
    scope: InstallScope,
): InstallInstructions {
    const slug = skill.slug;

    let placement: string;
    let steps: string[];
    let notes: string;

    switch (target) {
        case 'claude-code':
            if (scope === 'project') {
                placement = `.claude/skills/${slug}/`;
                steps = [`mkdir -p .claude/skills/${slug}`, `# Extract ${slug}.zip into .claude/skills/${slug}/`];
            } else {
                placement = `~/.claude/skills/`;
                steps = [`mkdir -p ~/.claude/skills`, `# Extract ${slug}.zip into ~/.claude/skills/${slug}/`];
            }
            notes = 'Claude Code auto-discovers skills in .claude/skills/. No additional config needed.';
            break;
        case 'github-copilot':
            if (scope === 'project') {
                placement = `.github/skills/${slug}/`;
                steps = [`mkdir -p .github/skills/${slug}`, `# Extract ${slug}.zip into .github/skills/${slug}/`];
            } else {
                placement = `~/.copilot/skills/`;
                steps = [`mkdir -p ~/.copilot/skills`, `# Extract ${slug}.zip into ~/.copilot/skills/${slug}/`];
            }
            notes = 'GitHub Copilot loads skills from .github/skills/ or ~/.copilot/skills/.';
            break;
        case 'opencode':
            if (scope === 'project') {
                placement = `.opencode/skills/${slug}/`;
                steps = [`mkdir -p .opencode/skills/${slug}`, `# Extract ${slug}.zip into .opencode/skills/${slug}/`];
            } else {
                placement = `~/.config/opencode/skills/`;
                steps = [
                    `mkdir -p ~/.config/opencode/skills`,
                    `# Extract ${slug}.zip into ~/.config/opencode/skills/${slug}/`,
                ];
            }
            notes = 'OpenCode loads skills from .opencode/skills/ or ~/.config/opencode/skills/.';
            break;
        case 'amazon-kiro':
            if (scope === 'project') {
                placement = `.kiro/skills/${slug}/`;
                steps = [`mkdir -p .kiro/skills/${slug}`, `# Extract ${slug}.zip into .kiro/skills/${slug}/`];
            } else {
                placement = `~/.kiro/skills/`;
                steps = [`mkdir -p ~/.kiro/skills`, `# Extract ${slug}.zip into ~/.kiro/skills/${slug}/`];
            }
            notes = 'Amazon Kiro loads skills from .kiro/skills/.';
            break;
        case 'openai-codex':
            if (scope === 'project') {
                placement = `.codex/config.toml`;
                steps = [
                    `# Add skills path to .codex/config.toml`,
                    `# skills_dir = ".codex/skills"`,
                    `mkdir -p .codex/skills/${slug}`,
                    `# Extract ${slug}.zip into .codex/skills/${slug}/`,
                ];
            } else {
                placement = `~/.codex/`;
                steps = [`mkdir -p ~/.codex/${slug}`, `# Extract ${slug}.zip into ~/.codex/${slug}/`];
            }
            notes = 'OpenAI Codex uses a config.toml to discover skill directories.';
            break;
        case 'jetbrains-junie':
            if (scope === 'project') {
                placement = `project Agent Skills`;
                steps = [
                    `# In JetBrains IDE: Settings → Tools → Junie → Agent Skills → Add`,
                    `# Point to the extracted skill directory`,
                ];
            } else {
                placement = `user-level Agent Skills`;
                steps = [
                    `# In JetBrains IDE: Settings → Tools → Junie → Agent Skills → Add (user level)`,
                    `# Point to the extracted skill directory`,
                ];
            }
            notes = 'In JetBrains IDE, add the skill via Settings → Tools → Junie → Agent Skills.';
            break;
    }

    const scriptNote =
        skill.scripts && skill.scripts.length > 0
            ? '\n# Script permissions: run via interpreter\n#   bash scripts/name.sh  /  python3 scripts/name.py  /  node scripts/name.mjs\n# Or after zip extraction:  chmod +x scripts/*.sh'
            : '';
    const copyablePrompt = steps.join('\n') + scriptNote;

    return { placement, steps, notes, copyablePrompt };
}

export function buildInvokePrompt(skill: SkillDef, task: string): string {
    return task.trim() ? `Use the ${skill.title} skill to ${task.trim()}.` : `Use the ${skill.title} skill.`;
}
