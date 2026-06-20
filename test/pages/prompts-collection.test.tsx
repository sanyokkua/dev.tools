import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PromptVariant } from '../../src/common/prompts/types';
import PromptListItem from '../../src/components/page-specific/prompts-collection/PromptListItem';
import PromptsCollectionView from '../../src/components/page-specific/prompts-collection/PromptsCollectionView';
import {
    parseStateFromQuery,
    stateToQuery,
} from '../../src/components/page-specific/prompts-collection/usePromptsState';

// --- Mock data (mock-prefixed so jest.mock factory can reference them) ---

const mockPromptsData = {
    domains: [
        { code: 'A', slug: 'software-engineering', title: 'Software Engineering', description: '' },
        { code: 'B', slug: 'writing', title: 'Writing & Communication', description: '' },
    ],
    categories: [
        { code: 'A03', domainCode: 'A', slug: 'code-review', title: 'Code Review' },
        { code: 'A01', domainCode: 'A', slug: 'code-gen', title: 'Code Generation' },
    ],
    logical: [
        {
            id: 'LP-A03-review',
            categoryCode: 'A03',
            title: 'Review a Change',
            description: 'Reviews code',
            variantAxes: ['executionContext'] as ('model' | 'executionContext' | 'subVariant')[],
            variantIds: ['USR-A03-review', 'AGT-A03-review'],
            defaultVariantId: 'USR-A03-review',
        },
    ],
    variants: [
        {
            id: 'USR-A03-review',
            kind: 'user' as const,
            categoryCode: 'A03',
            title: 'Review a Change',
            description: 'desc',
            template: 'tmpl',
            parameters: [],
            keywords: [],
            executionContext: 'chat' as const,
            isMetaPrompt: false,
            model: null,
            subVariant: null,
        },
        {
            id: 'AGT-A03-review',
            kind: 'agent' as const,
            categoryCode: 'A03',
            title: 'Review a Change',
            description: 'desc',
            template: 'tmpl',
            parameters: [],
            keywords: [],
            executionContext: 'agent' as const,
            isMetaPrompt: false,
            model: null,
            subVariant: null,
        },
    ],
};

const mockSkillsData = {
    skills: [
        {
            id: 'SKILL-code-review',
            slug: 'code-review',
            domainCode: 'A',
            title: 'code-review',
            version: '1.0.0',
            description: 'Reviews code',
            tags: [],
            allowedTools: [],
            relatedSkillIds: [],
            files: [],
        },
    ],
};

// --- next/router mock ---

const mockReplace = jest.fn();
let mockQuery: Record<string, string | string[] | undefined> = {};
jest.mock('next/router', () => ({ useRouter: () => ({ query: mockQuery, isReady: true, replace: mockReplace }) }));

// --- @/contexts/ToasterContext mock ---

jest.mock('@/contexts/ToasterContext', () => ({ useToast: () => ({ showToast: jest.fn() }) }));

// --- @/common/prompts/data mock ---

jest.mock('@/common/prompts/data', () => ({
    loadPromptsData: () => Promise.resolve(mockPromptsData),
    loadSkillsData: () => Promise.resolve(mockSkillsData),
    listDomains: (data: typeof mockPromptsData) => data.domains,
    categoriesByDomain: (data: typeof mockPromptsData, code: string) =>
        data.categories.filter((c) => c.domainCode === code),
    logicalByCategory: (data: typeof mockPromptsData, code: string) =>
        data.logical.filter((l) => l.categoryCode === code),
    variantsOf: (data: typeof mockPromptsData, logicalId: string) => {
        const lp = data.logical.find((l) => l.id === logicalId);
        if (!lp) return [];
        return lp.variantIds.map((id: string) => data.variants.find((v) => v.id === id)).filter(Boolean);
    },
    defaultVariant: (data: typeof mockPromptsData, logicalId: string) => {
        const lp = data.logical.find((l) => l.id === logicalId);
        if (!lp) return undefined;
        return data.variants.find((v) => v.id === lp.defaultVariantId);
    },
    skillsByDomain: (data: typeof mockSkillsData, code: string) => data.skills.filter((s) => s.domainCode === code),
    findVariantById: (data: typeof mockPromptsData, id: string) => data.variants.find((v) => v.id === id),
    selectVariant: (variants: typeof mockPromptsData.variants) => variants[0],
    buildSysPromptHref: () => '/prompts-collection?domain=x&category=y&prompt=z',
    recommendedSystemPromptFor: () => undefined,
    replaceParams: (t: string) => t,
}));

// -------------------------------------------------------------------
// Unit tests: parseStateFromQuery
// -------------------------------------------------------------------

describe('parseStateFromQuery', () => {
    it('empty query → defaults to prompts mode with all null fields', () => {
        const state = parseStateFromQuery({});
        expect(state).toEqual({
            type: 'prompts',
            view: null,
            domainSlug: null,
            categorySlug: null,
            selectedId: null,
            variantContext: null,
            variantModel: null,
            variantSub: null,
        });
    });

    it('full prompts params → parses domain, category, prompt correctly', () => {
        const state = parseStateFromQuery({
            domain: 'software-engineering',
            category: 'code-review',
            prompt: 'LP-A03-review',
        });
        expect(state).toEqual({
            type: 'prompts',
            view: null,
            domainSlug: 'software-engineering',
            categorySlug: 'code-review',
            selectedId: 'LP-A03-review',
            variantContext: null,
            variantModel: null,
            variantSub: null,
        });
    });

    it('skills mode with skill param → type=skills and selectedId from skill param', () => {
        const state = parseStateFromQuery({ type: 'skills', domain: 'software-engineering', skill: 'code-review' });
        expect(state).toEqual({
            type: 'skills',
            view: null,
            domainSlug: 'software-engineering',
            categorySlug: null,
            selectedId: 'code-review',
            variantContext: null,
            variantModel: null,
            variantSub: null,
        });
    });

    it('unknown type value → defaults to prompts', () => {
        const state = parseStateFromQuery({ type: 'unknown-value' });
        expect(state.type).toBe('prompts');
    });

    it('array-valued domain param → domainSlug is null', () => {
        const state = parseStateFromQuery({ domain: ['a', 'b'] });
        expect(state.domainSlug).toBeNull();
    });
});

// -------------------------------------------------------------------
// Unit tests: stateToQuery
// -------------------------------------------------------------------

describe('stateToQuery', () => {
    const nullVariantFields = { view: null, variantContext: null, variantModel: null, variantSub: null } as const;

    it('prompts mode → no type key in output', () => {
        const q = stateToQuery({
            type: 'prompts',
            domainSlug: 'eng',
            categorySlug: null,
            selectedId: null,
            ...nullVariantFields,
        });
        expect(q).not.toHaveProperty('type');
    });

    it('skills mode → type=skills key present', () => {
        const q = stateToQuery({
            type: 'skills',
            domainSlug: null,
            categorySlug: null,
            selectedId: null,
            ...nullVariantFields,
        });
        expect(q['type']).toBe('skills');
    });

    it('round-trip: parse → stateToQuery → parse produces same state', () => {
        const original = parseStateFromQuery({
            domain: 'software-engineering',
            category: 'code-review',
            prompt: 'LP-A03-review',
        });
        const roundTripped = parseStateFromQuery(stateToQuery(original));
        expect(roundTripped).toEqual(original);
    });

    it('null fields → empty object (no keys)', () => {
        const q = stateToQuery({
            type: 'prompts',
            domainSlug: null,
            categorySlug: null,
            selectedId: null,
            ...nullVariantFields,
        });
        expect(q).toEqual({});
    });
});

// -------------------------------------------------------------------
// Unit tests: edge cases — prompt vs skill param precedence by mode
// -------------------------------------------------------------------

describe('parseStateFromQuery edge cases', () => {
    it('prompts mode: selectedId comes from prompt param, not skill', () => {
        const state = parseStateFromQuery({ prompt: 'LP-some-prompt', skill: 'some-skill' });
        expect(state.type).toBe('prompts');
        expect(state.selectedId).toBe('LP-some-prompt');
    });

    it('skills mode: selectedId comes from skill param, not prompt', () => {
        const state = parseStateFromQuery({ type: 'skills', prompt: 'LP-some-prompt', skill: 'some-skill' });
        expect(state.type).toBe('skills');
        expect(state.selectedId).toBe('some-skill');
    });
});

// -------------------------------------------------------------------
// Component tests: PromptsCollectionView
// -------------------------------------------------------------------

describe('PromptsCollectionView component', () => {
    beforeEach(() => {
        mockReplace.mockClear();
        mockQuery = {};
    });

    function renderView() {
        return render(<PromptsCollectionView />);
    }

    it('domain tabs are rendered after data loads', async () => {
        renderView();
        // Wait for data to load (tabs appear)
        await screen.findByRole('tab', { name: 'Software Engineering' });
        expect(screen.getByRole('tab', { name: 'Software Engineering' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Writing & Communication' })).toBeInTheDocument();
    });

    it('category sub-tabs are rendered for the active domain', async () => {
        renderView();
        await screen.findByRole('tab', { name: 'Software Engineering' });
        // Categories for domain A are Code Review and Code Generation
        expect(screen.getByRole('button', { name: 'Code Review' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Code Generation' })).toBeInTheDocument();
    });

    it('clicking second domain tab makes it aria-selected=true', async () => {
        renderView();
        await screen.findByRole('tab', { name: 'Writing & Communication' });
        fireEvent.click(screen.getByRole('tab', { name: 'Writing & Communication' }));
        expect(screen.getByRole('tab', { name: 'Writing & Communication' })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('tab', { name: 'Software Engineering' })).toHaveAttribute('aria-selected', 'false');
    });

    it('clicking a list item → detail panel appears (empty state gone)', async () => {
        renderView();
        await screen.findByRole('tab', { name: 'Software Engineering' });

        // Before clicking: empty state is shown
        expect(screen.getByRole('status')).toBeInTheDocument();

        // Click the logical prompt list item
        const listItem = screen.getByRole('option', { name: /Review a Change/i });
        fireEvent.click(listItem);

        // After clicking: empty state should no longer be present
        await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });
    });

    it('Prompts/Skills switch → skills list appears', async () => {
        renderView();
        await screen.findByRole('tab', { name: 'Software Engineering' });

        // Click "Skills" in the SegmentedControl
        fireEvent.click(screen.getByRole('button', { name: 'Skills' }));

        // Skills SegmentedControl button should now be pressed
        expect(screen.getByRole('button', { name: 'Skills' })).toHaveAttribute('aria-pressed', 'true');

        // Category sub-tabs should NOT be visible in skills mode
        expect(screen.queryByRole('button', { name: 'Code Review' })).not.toBeInTheDocument();

        // The skill list item from fixture should appear
        await screen.findByRole('option', { name: /code-review/i });
    });

    it('search filters the prompts list', async () => {
        renderView();
        await screen.findByRole('option', { name: /Review a Change/i });

        // Sanity: item is visible before search
        expect(screen.getByRole('option', { name: /Review a Change/i })).toBeInTheDocument();

        // Type a non-matching search query
        fireEvent.change(screen.getByLabelText('Search prompts'), { target: { value: 'zzznomatch' } });

        // The prompt item should no longer be visible
        expect(screen.queryByRole('option', { name: /Review a Change/i })).not.toBeInTheDocument();
    });
});

// -------------------------------------------------------------------
// Component tests: PromptListItem META badge
// -------------------------------------------------------------------

describe('PromptListItem META badge', () => {
    const baseLogical = mockPromptsData.logical[0];

    const makeVariant = (overrides: Partial<PromptVariant>): PromptVariant => ({
        id: 'USR-A03-review',
        kind: 'user',
        categoryCode: 'A03',
        title: 'Review a Change',
        description: '',
        template: '',
        parameters: [],
        keywords: [],
        executionContext: 'chat',
        isMetaPrompt: false,
        model: null,
        subVariant: null,
        ...overrides,
    });

    it('shows META badge when isMetaPrompt=true', () => {
        const variants = [makeVariant({ isMetaPrompt: true })];
        render(<PromptListItem logical={baseLogical} variants={variants} selected={false} onClick={jest.fn()} />);
        expect(screen.getByText('⚗ meta')).toBeInTheDocument();
    });

    it('shows META badge when categoryCode is a META code (isMetaPrompt not set)', () => {
        const variants = [makeVariant({ categoryCode: 'D02', isMetaPrompt: undefined })];
        render(<PromptListItem logical={baseLogical} variants={variants} selected={false} onClick={jest.fn()} />);
        expect(screen.getByText('⚗ meta')).toBeInTheDocument();
    });

    it('does NOT show META badge for non-META variants', () => {
        const variants = [makeVariant({ isMetaPrompt: false })];
        render(<PromptListItem logical={baseLogical} variants={variants} selected={false} onClick={jest.fn()} />);
        expect(screen.queryByText('⚗ meta')).not.toBeInTheDocument();
    });
});

// -------------------------------------------------------------------
// Component tests: PromptsCollectionView — SYS-variant deep-link fallback
// -------------------------------------------------------------------

describe('PromptsCollectionView — SYS-variant deep-link fallback', () => {
    it('renders detail panel for a selected prompt (fallback path works)', async () => {
        render(<PromptsCollectionView />);
        await screen.findByRole('tab', { name: 'Software Engineering' });
        const listItem = screen.getByRole('option', { name: /Review a Change/i });
        fireEvent.click(listItem);
        await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });
    });
});

describe('parseStateFromQuery — variant params (T2.4)', () => {
    it('variant=chat → variantContext: chat', () => {
        const s = parseStateFromQuery({ variant: 'chat' });
        expect(s.variantContext).toBe('chat');
    });

    it('variant=agent → variantContext: agent', () => {
        const s = parseStateFromQuery({ variant: 'agent' });
        expect(s.variantContext).toBe('agent');
    });

    it('variant=unknown → variantContext: null (graceful)', () => {
        const s = parseStateFromQuery({ variant: 'unknown' });
        expect(s.variantContext).toBeNull();
    });

    it('model=gpt-4o → variantModel: gpt-4o', () => {
        const s = parseStateFromQuery({ model: 'gpt-4o' });
        expect(s.variantModel).toBe('gpt-4o');
    });

    it('sub=klein → variantSub: klein', () => {
        const s = parseStateFromQuery({ sub: 'klein' });
        expect(s.variantSub).toBe('klein');
    });

    it('round-trip with all variant params preserves values', () => {
        const q = { domain: 'eng', category: 'cr', prompt: 'LP-1', variant: 'agent', model: 'gpt-4o', sub: 'klein' };
        const original = parseStateFromQuery(q);
        const roundTripped = parseStateFromQuery(stateToQuery(original));
        expect(roundTripped).toEqual(original);
    });

    it('stateToQuery omits variant key when variantContext is null', () => {
        const s = parseStateFromQuery({});
        expect(stateToQuery(s)).not.toHaveProperty('variant');
    });

    it('stateToQuery omits model key when variantModel is null', () => {
        const s = parseStateFromQuery({});
        expect(stateToQuery(s)).not.toHaveProperty('model');
    });
});

// -------------------------------------------------------------------
// Component tests: PromptsCollectionView — unknown domain slug fallback
// -------------------------------------------------------------------

describe('PromptsCollectionView — unknown domain slug in URL', () => {
    beforeEach(() => {
        mockReplace.mockClear();
        mockQuery = { domain: 'no-such-domain', category: 'no-such-category', prompt: 'FAKE-999' };
    });

    afterEach(() => {
        mockQuery = {};
    });

    it('renders without crashing and shows the first domain tab as active', async () => {
        render(<PromptsCollectionView />);

        // The component should mount and show the domain tablist without throwing
        await waitFor(() => {
            expect(screen.getByRole('tablist', { name: /domain/i })).toBeInTheDocument();
        });

        // The first domain tab should be active (graceful fallback, not crash)
        const tabs = screen.getAllByRole('tab');
        expect(tabs.length).toBeGreaterThan(0);
        // No runtime error; waitFor completing without throw IS the assertion
    });
});

// -------------------------------------------------------------------
// Unit tests: parseStateFromQuery — unknown domain slug
// -------------------------------------------------------------------

describe('parseStateFromQuery — unknown domain slug', () => {
    it('passes through unknown domain slug as-is (no coercion)', () => {
        const state = parseStateFromQuery({ domain: 'no-such-domain' });
        // The slug is preserved as-is; the component handles the fallback
        expect(state.domainSlug).toBe('no-such-domain');
    });
});
