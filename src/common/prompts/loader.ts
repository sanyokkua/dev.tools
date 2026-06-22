import { CATEGORY_LOADERS, SKILL_LOADERS } from './loaders.generated';
import { MANIFEST } from './manifest.generated';
import type { LogicalPromptDef, Manifest, SkillDef } from './model/types';

export function loadManifest(): Manifest {
    return MANIFEST;
}

const _categoryCache: Record<string, Promise<{ prompts: LogicalPromptDef[] }>> = {};

export function loadCategory(categoryCode: string): Promise<{ prompts: LogicalPromptDef[] }> {
    const cached = _categoryCache[categoryCode];
    if (cached) return cached;
    const loader = CATEGORY_LOADERS[categoryCode];
    if (!loader) return Promise.reject(new Error(`Unknown category: ${categoryCode}`));
    return (_categoryCache[categoryCode] = loader());
}

export async function getLogicalPrompt(id: string): Promise<LogicalPromptDef> {
    const match = /^LP-([A-Z]\d+)-/.exec(id);
    if (!match) throw new Error(`Invalid prompt id: ${id}`);
    // match[1] is string (not string|undefined): RegExpExecArray extends Array<string>.
    // noUncheckedIndexedAccess is NOT set in tsconfig.json — confirmed by grep.
    const { prompts } = await loadCategory(match[1]);
    const found = prompts.find((p) => p.id === id);
    if (!found) throw new Error(`Prompt not found: ${id}`);
    return found;
}

const _skillCache: Record<string, Promise<SkillDef>> = {};

export async function loadSkill(slug: string): Promise<SkillDef> {
    const cached = _skillCache[slug];
    if (cached) return cached;
    const loader = SKILL_LOADERS[slug];
    if (!loader) return Promise.reject(new Error(`Unknown skill: ${slug}`));
    return (_skillCache[slug] = loader().then((m) => m.skill));
}
