import { buildCatalogRowHref, buildSysPromptHref } from '../../../src/common/prompts/data';
import type { CatalogRow } from '../../../src/common/prompts/types';

describe('buildSysPromptHref', () => {
    it('returns /prompts-collection?domain=...&category=...&prompt=... without basePath', () => {
        const href = buildSysPromptHref('sys-prompt-1', 'coding', 'refactoring');
        const url = new URL(href, 'http://localhost');
        expect(url.pathname).toBe('/prompts-collection');
        expect(url.searchParams.get('domain')).toBe('coding');
        expect(url.searchParams.get('category')).toBe('refactoring');
        expect(url.searchParams.get('prompt')).toBe('sys-prompt-1');
        expect(href.startsWith('/prompts-collection')).toBe(true);
    });

    it('returns /BASE/prompts-collection?... when basePath is set', () => {
        const href = buildSysPromptHref('sys-prompt-1', 'coding', 'refactoring', '/dev-tools');
        expect(href.startsWith('/dev-tools/prompts-collection')).toBe(true);
        const url = new URL(href, 'http://localhost');
        expect(url.pathname).toBe('/dev-tools/prompts-collection');
        expect(url.searchParams.get('domain')).toBe('coding');
        expect(url.searchParams.get('category')).toBe('refactoring');
        expect(url.searchParams.get('prompt')).toBe('sys-prompt-1');
    });

    it('encodes special characters in param values correctly', () => {
        const href = buildSysPromptHref('id with spaces', 'domain&one', 'cat=two');
        const url = new URL(href, 'http://localhost');
        expect(url.searchParams.get('prompt')).toBe('id with spaces');
        expect(url.searchParams.get('domain')).toBe('domain&one');
        expect(url.searchParams.get('category')).toBe('cat=two');
    });
});

describe('buildCatalogRowHref', () => {
    const promptRowWithCategory: CatalogRow = {
        id: 'my-prompt',
        kind: 'prompt',
        title: 'My Prompt',
        domainCode: 'D01',
        domainSlug: 'writing',
        domainTitle: 'Writing',
        categorySlug: 'editing',
        categoryTitle: 'Editing',
        isMetaPrompt: false,
        hasChat: true,
        hasAgent: false,
        hasModel: false,
        modelCount: 0,
        variantSummary: 'chat',
    };

    const promptRowWithoutCategory: CatalogRow = { ...promptRowWithCategory, id: 'no-cat-prompt', categorySlug: null };

    const skillRow: CatalogRow = {
        id: 'my-skill',
        kind: 'skill',
        title: 'My Skill',
        domainCode: 'D02',
        domainSlug: 'devops',
        domainTitle: 'DevOps',
        categorySlug: null,
        categoryTitle: 'Skills',
        isMetaPrompt: false,
        hasChat: false,
        hasAgent: false,
        hasModel: false,
        modelCount: 0,
        variantSummary: 'ci · deploy',
    };

    it('prompt-type row → /prompts-collection?domain=...&prompt=...&category=...', () => {
        const href = buildCatalogRowHref(promptRowWithCategory);
        expect(href.startsWith('/prompts-collection')).toBe(true);
        const url = new URL(href, 'http://localhost');
        expect(url.searchParams.get('domain')).toBe('writing');
        expect(url.searchParams.get('prompt')).toBe('my-prompt');
        expect(url.searchParams.get('category')).toBe('editing');
        expect(url.searchParams.get('type')).toBeNull();
    });

    it('prompt-type row without categorySlug → no category param', () => {
        const href = buildCatalogRowHref(promptRowWithoutCategory);
        const url = new URL(href, 'http://localhost');
        expect(url.searchParams.get('domain')).toBe('writing');
        expect(url.searchParams.get('prompt')).toBe('no-cat-prompt');
        expect(url.searchParams.get('category')).toBeNull();
    });

    it('skill-type row → /prompts-collection?type=skills&domain=...&skill=...', () => {
        const href = buildCatalogRowHref(skillRow);
        expect(href.startsWith('/prompts-collection')).toBe(true);
        const url = new URL(href, 'http://localhost');
        expect(url.searchParams.get('type')).toBe('skills');
        expect(url.searchParams.get('domain')).toBe('devops');
        expect(url.searchParams.get('skill')).toBe('my-skill');
        expect(url.searchParams.get('prompt')).toBeNull();
    });

    it('prepends basePath for prompt-type row when basePath is set', () => {
        const href = buildCatalogRowHref(promptRowWithCategory, '/dev-tools');
        expect(href.startsWith('/dev-tools/prompts-collection')).toBe(true);
        const url = new URL(href, 'http://localhost');
        expect(url.pathname).toBe('/dev-tools/prompts-collection');
    });

    it('prepends basePath for skill-type row when basePath is set', () => {
        const href = buildCatalogRowHref(skillRow, '/dev-tools');
        expect(href.startsWith('/dev-tools/prompts-collection')).toBe(true);
        const url = new URL(href, 'http://localhost');
        expect(url.pathname).toBe('/dev-tools/prompts-collection');
        expect(url.searchParams.get('type')).toBe('skills');
    });

    it('prompt-type row: no prefix when basePath is empty string (default)', () => {
        const href = buildCatalogRowHref(promptRowWithCategory);
        expect(href.startsWith('/prompts-collection')).toBe(true);
        expect(href.startsWith('//prompts-collection')).toBe(false);
    });

    it('skill-type row: no prefix when basePath is empty string (default)', () => {
        const href = buildCatalogRowHref(skillRow);
        expect(href.startsWith('/prompts-collection')).toBe(true);
        expect(href.startsWith('//prompts-collection')).toBe(false);
    });
});
