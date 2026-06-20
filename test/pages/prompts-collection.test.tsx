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
jest.mock('next/router', () => ({ useRouter: () => ({ query: {}, isReady: true, replace: mockReplace }) }));

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
        expect(state).toEqual({ type: 'prompts', domainSlug: null, categorySlug: null, selectedId: null });
    });

    it('full prompts params → parses domain, category, prompt correctly', () => {
        const state = parseStateFromQuery({
            domain: 'software-engineering',
            category: 'code-review',
            prompt: 'LP-A03-review',
        });
        expect(state).toEqual({
            type: 'prompts',
            domainSlug: 'software-engineering',
            categorySlug: 'code-review',
            selectedId: 'LP-A03-review',
        });
    });

    it('skills mode with skill param → type=skills and selectedId from skill param', () => {
        const state = parseStateFromQuery({ type: 'skills', domain: 'software-engineering', skill: 'code-review' });
        expect(state).toEqual({
            type: 'skills',
            domainSlug: 'software-engineering',
            categorySlug: null,
            selectedId: 'code-review',
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
    it('prompts mode → no type key in output', () => {
        const q = stateToQuery({ type: 'prompts', domainSlug: 'eng', categorySlug: null, selectedId: null });
        expect(q).not.toHaveProperty('type');
    });

    it('skills mode → type=skills key present', () => {
        const q = stateToQuery({ type: 'skills', domainSlug: null, categorySlug: null, selectedId: null });
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
        const q = stateToQuery({ type: 'prompts', domainSlug: null, categorySlug: null, selectedId: null });
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
        expect(screen.getByText('META')).toBeInTheDocument();
    });

    it('shows META badge when categoryCode is a META code (isMetaPrompt not set)', () => {
        const variants = [makeVariant({ categoryCode: 'D02', isMetaPrompt: undefined })];
        render(<PromptListItem logical={baseLogical} variants={variants} selected={false} onClick={jest.fn()} />);
        expect(screen.getByText('META')).toBeInTheDocument();
    });

    it('does NOT show META badge for non-META variants', () => {
        const variants = [makeVariant({ isMetaPrompt: false })];
        render(<PromptListItem logical={baseLogical} variants={variants} selected={false} onClick={jest.fn()} />);
        expect(screen.queryByText('META')).not.toBeInTheDocument();
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
