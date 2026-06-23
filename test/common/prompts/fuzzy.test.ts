import { fuzzyScore, paletteSearch } from '@/common/prompts/fuzzy';
import type { Manifest, ManifestLogical, ManifestSkill } from '@/common/prompts/model/types';

// ── fuzzyScore ────────────────────────────────────────────────────────────────

describe('fuzzyScore', () => {
    it('returns 0 for empty query', () => {
        expect(fuzzyScore('', 'hello')).toBe(0);
    });

    it('returns high score for exact match', () => {
        expect(fuzzyScore('hello', 'hello')).toBeGreaterThan(50);
    });

    it('ranks prefix match above mid-string match', () => {
        const prefixScore = fuzzyScore('code', 'code review');
        const midScore = fuzzyScore('code', 'review code');
        expect(prefixScore).toBeGreaterThan(midScore);
    });

    it('returns positive score for substring match', () => {
        expect(fuzzyScore('rev', 'code review')).toBeGreaterThan(0);
    });

    it('returns positive score for fuzzy char-order match', () => {
        // 'cr' → 'c' in "code", 'r' in "review"
        expect(fuzzyScore('cr', 'code review')).toBeGreaterThan(0);
    });

    it('returns -1 when chars not found in order', () => {
        expect(fuzzyScore('xyz', 'hello')).toBe(-1);
    });

    it('is case-insensitive', () => {
        expect(fuzzyScore('CODE', 'code review')).toBeGreaterThan(0);
    });

    it('handles special characters in query without throwing', () => {
        expect(() => fuzzyScore('(test)', 'test')).not.toThrow();
    });

    it('returns -1 when query is longer than any match possible', () => {
        expect(fuzzyScore('averylongquerythatexceedstarget', 'short')).toBe(-1);
    });
});

// ── paletteSearch ─────────────────────────────────────────────────────────────

const mockManifest: Manifest = {
    domains: [{ code: 'A', title: 'Engineering', description: '', slug: 'engineering' }],
    categories: [{ code: 'A01', domainCode: 'A', slug: 'code-review', title: 'Code Review' }],
    logical: [
        {
            id: 'lp-1',
            categoryCode: 'A01',
            domainCode: 'A',
            title: 'Code Review',
            description: 'Review code',
            keywords: ['review', 'code'],
            tags: [],
            variantAxes: [],
            hasChat: true,
            hasAgent: false,
            hasModel: false,
            modelCount: 0,
            isMetaPrompt: false,
        },
    ],
    skills: [
        {
            id: 'SKILL-tdd',
            slug: 'tdd',
            domainCode: 'A',
            title: 'TDD',
            version: '1.0',
            description: 'Test-driven development',
            tags: ['testing', 'tdd'],
            fileCount: 0,
        },
    ],
};

describe('paletteSearch', () => {
    it('returns items when query is empty', () => {
        expect(paletteSearch(mockManifest, '').length).toBeGreaterThan(0);
    });

    it('finds prompt by title', () => {
        const results = paletteSearch(mockManifest, 'code review');
        expect(results.some((r) => r.type === 'prompt' && r.label === 'Code Review')).toBe(true);
    });

    it('finds skill by title', () => {
        const results = paletteSearch(mockManifest, 'tdd');
        expect(results.some((r) => r.type === 'skill' && r.label === 'TDD')).toBe(true);
    });

    it('finds prompt by keyword', () => {
        expect(paletteSearch(mockManifest, 'review').some((r) => r.type === 'prompt')).toBe(true);
    });

    it('finds skill by tag', () => {
        expect(paletteSearch(mockManifest, 'testing').some((r) => r.type === 'skill')).toBe(true);
    });

    it('returns empty array for no match', () => {
        expect(paletteSearch(mockManifest, 'zzzunmatchablexyz')).toHaveLength(0);
    });

    it('sorts by score descending', () => {
        const results = paletteSearch(mockManifest, 'code');
        for (let i = 1; i < results.length; i++) {
            expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
        }
    });

    it('populates sublabel with domain info for prompts', () => {
        const result = paletteSearch(mockManifest, 'code review').find((r) => r.type === 'prompt');
        expect(result?.sublabel).toContain('Engineering');
    });

    it('populates sublabel with domain for skills', () => {
        const result = paletteSearch(mockManifest, 'tdd').find((r) => r.type === 'skill');
        expect(result?.sublabel).toContain('Engineering');
    });

    it('prompt result item has .id field', () => {
        const result = paletteSearch(mockManifest, 'code review').find((r) => r.type === 'prompt');
        expect((result?.item as ManifestLogical).id).toBe('lp-1');
    });

    it('skill result item has .slug field', () => {
        const result = paletteSearch(mockManifest, 'tdd').find((r) => r.type === 'skill');
        expect((result?.item as ManifestSkill).slug).toBe('tdd');
    });
});
