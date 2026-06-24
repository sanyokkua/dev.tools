import type { Manifest, ManifestLogical, ManifestSkill } from './model/types';

export interface PaletteResult {
    type: 'prompt' | 'skill';
    item: ManifestLogical | ManifestSkill;
    score: number;
    label: string;
    sublabel: string;
}

const MAX_PALETTE_RESULTS = 30;

/**
 * Scores how well `query` matches `target`. Returns ≥0 on match, -1 on no match.
 * Priority: exact > prefix > contains > fuzzy char-order.
 */
export function fuzzyScore(query: string, target: string): number {
    if (!query) return 0;
    const q = query.toLowerCase().trim();
    const t = target.toLowerCase();
    if (!q) return 0;

    if (t === q) return 100;
    if (t.startsWith(q)) return 90 + (q.length / t.length) * 5;
    if (t.includes(q)) return 75 + (1 - t.indexOf(q) / t.length) * 5;

    let qi = 0;
    let score = 0;
    let consecutive = 0;
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
        if (t[ti] === q[qi]) {
            qi++;
            consecutive++;
            score += consecutive * 2;
        } else {
            consecutive = 0;
        }
    }
    return qi < q.length ? -1 : score;
}

export function paletteSearch(manifest: Manifest, query: string): PaletteResult[] {
    const trimmed = query.trim();
    const results: PaletteResult[] = [];

    const categoryMap = new Map(manifest.categories.map((c) => [c.code, c]));
    const domainMap = new Map(manifest.domains.map((d) => [d.code, d]));

    for (const logical of manifest.logical) {
        const cat = categoryMap.get(logical.categoryCode);
        const domain = domainMap.get(logical.domainCode ?? cat?.domainCode ?? '');
        const sublabel = [domain?.title, cat?.title].filter(Boolean).join(' › ');

        if (!trimmed) {
            results.push({ type: 'prompt', item: logical, score: 0, label: logical.title, sublabel });
            continue;
        }

        const titleScore = fuzzyScore(trimmed, logical.title);
        const descScore = fuzzyScore(trimmed, logical.description);
        const kwScore = logical.keywords.length ? Math.max(...logical.keywords.map((k) => fuzzyScore(trimmed, k))) : -1;
        const score = Math.max(titleScore, descScore * 0.6, kwScore * 0.4);
        if (score >= 0) results.push({ type: 'prompt', item: logical, score, label: logical.title, sublabel });
    }

    for (const skill of manifest.skills) {
        const domain = domainMap.get(skill.domainCode);
        const sublabel = domain?.title ?? '';

        if (!trimmed) {
            results.push({ type: 'skill', item: skill, score: 0, label: skill.title, sublabel });
            continue;
        }

        const titleScore = fuzzyScore(trimmed, skill.title);
        const descScore = fuzzyScore(trimmed, skill.description);
        const tagScore = skill.tags.length ? Math.max(...skill.tags.map((tag) => fuzzyScore(trimmed, tag))) : -1;
        const score = Math.max(titleScore, descScore * 0.6, tagScore * 0.4);
        if (score >= 0) results.push({ type: 'skill', item: skill, score, label: skill.title, sublabel });
    }

    if (!trimmed) return results.slice(0, MAX_PALETTE_RESULTS);
    return results.toSorted((a, b) => b.score - a.score).slice(0, MAX_PALETTE_RESULTS);
}
