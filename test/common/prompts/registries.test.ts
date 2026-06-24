import { ABBREVIATIONS, expandAbbreviations } from '@/common/prompts/registries/abbreviations';
import { CONTEXTS } from '@/common/prompts/registries/contexts';
import { MODELS } from '@/common/prompts/registries/models';
import { STYLES } from '@/common/prompts/registries/styles';
import { TONES } from '@/common/prompts/registries/tones';
import { VALUE_SETS } from '@/common/prompts/registries/value-sets';

// ─── MODELS ────────────────────────────────────────────────────────────────

describe('registries/models', () => {
    it('has exactly 21 entries', () => {
        // Verified: models.md has 8 image models + 13 video models = 21.
        // Spec says 22 — flagged in commit message for content review.
        expect(MODELS).toHaveLength(21);
    });

    it('every entry has required string fields', () => {
        for (const m of MODELS) {
            expect(typeof m.id).toBe('string');
            expect(m.id.length).toBeGreaterThan(0);
            expect(typeof m.label).toBe('string');
            expect(m.label.length).toBeGreaterThan(0);
            expect(typeof m.slug).toBe('string');
            expect(m.slug.length).toBeGreaterThan(0);
        }
    });

    it('every entry has a non-empty modality array with valid values', () => {
        const valid = new Set(['image-gen', 'image-edit', 'video']);
        for (const m of MODELS) {
            expect(Array.isArray(m.modality)).toBe(true);
            expect(m.modality.length).toBeGreaterThan(0);
            for (const mod of m.modality) {
                expect(valid.has(mod)).toBe(true);
            }
        }
    });

    it('ids are unique', () => {
        const ids = MODELS.map((m) => m.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('slugs are unique', () => {
        const slugs = MODELS.map((m) => m.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
    });

    it('slugs contain only kebab-case characters', () => {
        for (const m of MODELS) {
            expect(m.slug).toMatch(/^[a-z0-9-]+$/);
        }
    });

    it('key models are present', () => {
        const ids = new Set(MODELS.map((m) => m.id));
        expect(ids.has('nano-banana-pro')).toBe(true);
        expect(ids.has('veo')).toBe(true);
        expect(ids.has('mochi')).toBe(true);
        expect(ids.has('flux-2')).toBe(true);
        expect(ids.has('wan-local')).toBe(true);
        expect(ids.has('wan-api')).toBe(true);
    });

    it('defaults field, if present, is a Record<string, string>', () => {
        for (const m of MODELS) {
            if (m.defaults !== undefined) {
                expect(typeof m.defaults).toBe('object');
                for (const val of Object.values(m.defaults)) {
                    expect(typeof val).toBe('string');
                }
            }
        }
    });
});

// ─── STYLES ────────────────────────────────────────────────────────────────

describe('registries/styles', () => {
    it('has exactly 24 entries', () => {
        expect(STYLES).toHaveLength(24);
    });

    it('every entry has required string fields', () => {
        for (const s of STYLES) {
            expect(typeof s.id).toBe('string');
            expect(s.id.length).toBeGreaterThan(0);
            expect(typeof s.label).toBe('string');
            expect(typeof s.definition).toBe('string');
        }
    });

    it('every entry has rules array with 5–9 items', () => {
        for (const s of STYLES) {
            expect(Array.isArray(s.rules)).toBe(true);
            expect(s.rules.length).toBeGreaterThanOrEqual(5);
            expect(s.rules.length).toBeLessThanOrEqual(9);
        }
    });

    it('ids are unique', () => {
        const ids = STYLES.map((s) => s.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('key style ids are present', () => {
        const ids = new Set(STYLES.map((s) => s.id));
        expect(ids.has('formal')).toBe(true);
        expect(ids.has('technical')).toBe(true);
        expect(ids.has('executive')).toBe(true);
        expect(ids.has('instructional')).toBe(true);
    });
});

// ─── TONES ─────────────────────────────────────────────────────────────────

describe('registries/tones', () => {
    it('has exactly 21 entries', () => {
        expect(TONES).toHaveLength(21);
    });

    it('every entry has required string fields', () => {
        for (const t of TONES) {
            expect(typeof t.id).toBe('string');
            expect(t.id.length).toBeGreaterThan(0);
            expect(typeof t.label).toBe('string');
            expect(typeof t.definition).toBe('string');
        }
    });

    it('every entry has a non-empty rules array', () => {
        for (const t of TONES) {
            expect(Array.isArray(t.rules)).toBe(true);
            expect(t.rules.length).toBeGreaterThan(0);
        }
    });

    it('ids are unique', () => {
        const ids = TONES.map((t) => t.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('key tone ids are present', () => {
        const ids = new Set(TONES.map((t) => t.id));
        expect(ids.has('confident')).toBe(true);
        expect(ids.has('supportive')).toBe(true);
        expect(ids.has('respectful')).toBe(true);
    });
});

// ─── CONTEXTS ──────────────────────────────────────────────────────────────

describe('registries/contexts', () => {
    it('has exactly 29 entries', () => {
        expect(CONTEXTS).toHaveLength(29);
    });

    it('every entry has required fields', () => {
        for (const c of CONTEXTS) {
            expect(typeof c.id).toBe('string');
            expect(c.id.length).toBeGreaterThan(0);
            expect(typeof c.label).toBe('string');
            expect(typeof c.styleId).toBe('string');
            expect(typeof c.toneId).toBe('string');
            expect(Array.isArray(c.structure)).toBe(true);
            expect(c.structure.length).toBeGreaterThan(0);
        }
    });

    it('every context group is a valid value', () => {
        const valid = new Set(['it-work', 'everyday', 'edge-case']);
        for (const c of CONTEXTS) {
            expect(valid.has(c.group)).toBe(true);
        }
    });

    it('ids are unique', () => {
        const ids = CONTEXTS.map((c) => c.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('every context styleId resolves to a style in STYLES', () => {
        const styleIds = new Set(STYLES.map((s) => s.id));
        for (const c of CONTEXTS) {
            expect(styleIds.has(c.styleId)).toBe(true);
        }
    });

    it('every context toneId resolves to a tone in TONES', () => {
        const toneIds = new Set(TONES.map((t) => t.id));
        for (const c of CONTEXTS) {
            expect(toneIds.has(c.toneId)).toBe(true);
        }
    });

    it('key context ids are present', () => {
        const ids = new Set(CONTEXTS.map((c) => c.id));
        expect(ids.has('manager')).toBe(true);
        expect(ids.has('senior-engineer')).toBe(true);
        expect(ids.has('junior-dev-feedback')).toBe(true);
    });
});

// ─── VALUE_SETS ────────────────────────────────────────────────────────────

describe('registries/value-sets', () => {
    it('has exactly 36 entries', () => {
        // 33 original + 3 added for Domain B: tone, style, context
        expect(VALUE_SETS).toHaveLength(36);
    });

    it('every entry has required fields', () => {
        for (const vs of VALUE_SETS) {
            expect(typeof vs.id).toBe('string');
            expect(vs.id.length).toBeGreaterThan(0);
            expect(typeof vs.label).toBe('string');
            expect(Array.isArray(vs.values)).toBe(true);
            expect(vs.values.length).toBeGreaterThan(0);
            expect(typeof vs.allowCustom).toBe('boolean');
        }
    });

    it('ids are unique', () => {
        const ids = VALUE_SETS.map((v) => v.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('ids are kebab-case', () => {
        for (const vs of VALUE_SETS) {
            expect(vs.id).toMatch(/^[a-z0-9-]+$/);
        }
    });

    it('programming-language set has expected values and allowCustom=true', () => {
        const pl = VALUE_SETS.find((v) => v.id === 'programming-language');
        expect(pl).toBeDefined();
        expect(pl!.allowCustom).toBe(true);
        expect(pl!.values).toContain('Python');
        expect(pl!.values).toContain('TypeScript');
        expect(pl!.values).toContain('Go');
    });

    it('output-format set exists and has allowCustom=false', () => {
        const of_ = VALUE_SETS.find((v) => v.id === 'output-format');
        expect(of_).toBeDefined();
        expect(of_!.allowCustom).toBe(false);
    });
});

// ─── ABBREVIATIONS ─────────────────────────────────────────────────────────

describe('registries/abbreviations', () => {
    it('has exactly 61 entries', () => {
        // Verified: abbreviations.md has 61 entries (ADR through C2PA).
        // Spec says 62 — flagged in commit message for content review.
        expect(Object.keys(ABBREVIATIONS)).toHaveLength(61);
    });

    it('every value contains an opening parenthesis (expansion has parens form)', () => {
        for (const [abbr, expansion] of Object.entries(ABBREVIATIONS)) {
            expect(expansion).toContain('(');
            expect(expansion.includes(`(${abbr})`) || expansion.includes(`(${abbr.toUpperCase()})`)).toBe(true);
        }
    });

    it('PR expands to Pull Request (PR)', () => {
        expect(ABBREVIATIONS['PR']).toBe('Pull Request (PR)');
    });

    it('ADR expands correctly', () => {
        expect(ABBREVIATIONS['ADR']).toBe('Architecture Decision Record (ADR)');
    });

    it('CI/CD key is present', () => {
        expect('CI/CD' in ABBREVIATIONS).toBe(true);
    });
});

// ─── expandAbbreviations ───────────────────────────────────────────────────

describe('expandAbbreviations', () => {
    it('returns empty string unchanged', () => {
        expect(expandAbbreviations('')).toBe('');
    });

    it('returns text with no known abbreviations unchanged', () => {
        const text = 'The quick brown fox jumps over the lazy dog.';
        expect(expandAbbreviations(text)).toBe(text);
    });

    it('expands a standalone known abbreviation', () => {
        const result = expandAbbreviations('Submit the PR when ready.');
        expect(result).toContain('Pull Request (PR)');
        expect(result).not.toContain(' PR ');
    });

    it('expands multiple abbreviations in one string', () => {
        const result = expandAbbreviations('Link the PR and ADR in the ticket.');
        expect(result).toContain('Pull Request (PR)');
        expect(result).toContain('Architecture Decision Record (ADR)');
    });

    it('does not expand abbreviation already in expanded form (idempotent)', () => {
        const text = 'A Pull Request (PR) was opened.';
        const result = expandAbbreviations(text);
        // Must not double-expand to "Pull Request (Pull Request (PR))"
        expect(result).not.toContain('Pull Request (Pull Request');
    });

    it('handles CI/CD (contains special chars) correctly', () => {
        const result = expandAbbreviations('Our CI/CD pipeline failed.');
        expect(result).toContain('Continuous Integration / Continuous Delivery (CI/CD)');
    });

    it('does not expand abbreviation inside a word', () => {
        // "Information" contains "OR" — verify no spurious expansion of ORM
        const text = 'Information about formatting.';
        const result = expandAbbreviations(text);
        expect(result).toBe(text);
    });
});
