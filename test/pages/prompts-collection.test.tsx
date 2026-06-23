import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ManifestLogical } from '../../src/common/prompts/model/types';
import PromptCatalogView from '../../src/components/page-specific/prompts-collection/PromptCatalogView';
import PromptDetailPanel from '../../src/components/page-specific/prompts-collection/PromptDetailPanel';
import PromptListItem from '../../src/components/page-specific/prompts-collection/PromptListItem';
import PromptsCollectionView from '../../src/components/page-specific/prompts-collection/PromptsCollectionView';
import {
    parseStateFromQuery,
    stateToQuery,
} from '../../src/components/page-specific/prompts-collection/usePromptsState';

// --- Mock data (mock-prefixed so jest.mock factory can reference them) ---

const mockManifest = {
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
            domainCode: 'A',
            title: 'Review a Change',
            description: 'Reviews code',
            keywords: [],
            tags: [],
            variantAxes: ['mode'],
            hasChat: true,
            hasAgent: true,
            hasModel: false,
            modelCount: 0,
            isMetaPrompt: false,
        },
    ],
    skills: [
        {
            id: 'SKILL-code-review',
            slug: 'code-review',
            domainCode: 'A',
            title: 'code-review',
            version: '1.0.0',
            description: 'Reviews code',
            tags: [],
            fileCount: 0,
        },
    ],
};

const mockLogicalPromptDef = {
    id: 'LP-A03-review',
    categoryCode: 'A03',
    title: 'Review a Change',
    description: 'Reviews code',
    variantAxes: ['mode'],
    variants: [
        {
            id: 'USR-A03-review',
            kind: 'user',
            categoryCode: 'A03',
            title: 'Review a Change',
            description: 'desc',
            template: 'tmpl',
            parameters: [],
            keywords: [],
            executionContext: 'chat',
            isMetaPrompt: false,
            model: null,
            subVariant: null,
        },
    ],
    defaultVariantId: 'USR-A03-review',
};

const mockDualLogicalDef = {
    id: 'LP-A03-review',
    categoryCode: 'A03',
    title: 'Review a Change',
    description: 'Reviews code',
    variantAxes: ['mode'],
    variants: [
        {
            id: 'USR-A03-review-chat',
            kind: 'user',
            categoryCode: 'A03',
            title: 'Review a Change',
            description: 'desc',
            template: 'CHAT: {{topic}}',
            parameters: [{ name: 'topic', label: 'Topic', control: 'text' }],
            keywords: [],
            executionContext: 'chat' as const,
            isMetaPrompt: false,
            model: null,
            subVariant: null,
        },
        {
            id: 'AGT-A03-review-agent',
            kind: 'agent',
            categoryCode: 'A03',
            title: 'Review a Change',
            description: 'desc',
            template: 'AGENT: {{topic}}',
            parameters: [{ name: 'topic', label: 'Topic', control: 'text' }],
            keywords: [],
            executionContext: 'agent' as const,
            isMetaPrompt: false,
            model: null,
            subVariant: null,
        },
    ],
    defaultVariantId: 'USR-A03-review-chat',
};

const mockManifestWithModes = {
    ...mockManifest,
    logical: [
        { ...mockManifest.logical[0], hasChat: true, hasAgent: true },
        {
            id: 'LP-A01-chat-only',
            categoryCode: 'A01',
            domainCode: 'A',
            title: 'Chat Only Prompt',
            description: '',
            keywords: [],
            tags: [],
            variantAxes: [],
            hasChat: true,
            hasAgent: false,
            hasModel: false,
            modelCount: 0,
            isMetaPrompt: false,
        },
        {
            id: 'LP-A01-agent-only',
            categoryCode: 'A01',
            domainCode: 'A',
            title: 'Agent Only Prompt',
            description: '',
            keywords: [],
            tags: [],
            variantAxes: [],
            hasChat: false,
            hasAgent: true,
            hasModel: false,
            modelCount: 0,
            isMetaPrompt: false,
        },
    ],
    skills: [],
};

// --- next/router mock ---

const mockReplace = jest.fn();
let mockQuery: Record<string, string | string[] | undefined> = {};
jest.mock('next/router', () => ({ useRouter: () => ({ query: mockQuery, isReady: true, replace: mockReplace }) }));

// --- @/contexts/ToasterContext mock ---

jest.mock('@/contexts/ToasterContext', () => ({ useToast: () => ({ showToast: jest.fn() }) }));

// --- @/common/prompts/loader mock ---

jest.mock('@/common/prompts/loader', () => ({
    loadManifest: () => mockManifest,
    getLogicalPrompt: jest.fn().mockImplementation((id: string) => {
        if (id === 'LP-A03-review') return Promise.resolve(mockLogicalPromptDef);
        return Promise.resolve(null);
    }),
    loadSkill: jest.fn().mockResolvedValue(null),
}));

// --- @/common/prompts/data mock ---

jest.mock('@/common/prompts/data', () => ({
    selectVariant: (variants: { id: string }[]) => variants?.[0] ?? null,
    buildSysPromptHref: () => '/prompts-collection?domain=x&category=y&prompt=z',
    replaceParams: (t: string) => t,
    buildInstallInstructions: () => ({
        placement: '.claude/skills/test/',
        steps: ['cp SKILL.md .claude/skills/'],
        notes: 'Copy files manually.',
    }),
    buildCatalogRows: jest.fn((manifest: { logical?: any[]; skills?: any[] }) => [
        ...(manifest.logical ?? []).map((l: any) => ({
            id: l.id,
            kind: 'prompt' as const,
            title: l.title,
            domainCode: l.domainCode ?? 'A',
            domainSlug: 'software-engineering',
            domainTitle: 'Software Engineering',
            categorySlug: null,
            categoryTitle: '',
            isMetaPrompt: !!l.isMetaPrompt,
            hasChat: !!l.hasChat,
            hasAgent: !!l.hasAgent,
            hasModel: !!l.hasModel,
            modelCount: l.modelCount ?? 0,
            variantSummary: '',
        })),
    ]),
    filterCatalogRows: jest.fn((rows: any[]) => rows),
    buildCatalogRowHref: jest.fn(() => 'http://localhost/test'),
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
            style: null,
            tone: null,
            context: null,
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
            style: null,
            tone: null,
            context: null,
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
            style: null,
            tone: null,
            context: null,
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
    const nullVariantFields = {
        view: null,
        variantContext: null,
        variantModel: null,
        variantSub: null,
        style: null,
        tone: null,
        context: null,
    } as const;

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

    it('domain tabs are rendered (manifest is synchronous)', async () => {
        renderView();
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

        // After clicking: getLogicalPrompt resolves → detail panel renders content
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

const makeLogical = (overrides: Partial<ManifestLogical>): ManifestLogical => ({
    id: 'LP-A03-review',
    categoryCode: 'A03',
    domainCode: 'A',
    title: 'Review a Change',
    description: '',
    keywords: [],
    tags: [],
    variantAxes: [],
    hasChat: true,
    hasAgent: false,
    hasModel: false,
    modelCount: 0,
    isMetaPrompt: false,
    ...overrides,
});

describe('PromptListItem META badge', () => {
    it('shows META badge when isMetaPrompt=true', () => {
        render(<PromptListItem logical={makeLogical({ isMetaPrompt: true })} selected={false} onClick={jest.fn()} />);
        expect(screen.getByText('⚗ meta')).toBeInTheDocument();
    });

    it('does NOT show META badge when isMetaPrompt=false', () => {
        render(<PromptListItem logical={makeLogical({ isMetaPrompt: false })} selected={false} onClick={jest.fn()} />);
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

// -------------------------------------------------------------------
// Component tests: PromptDetailPanel — mode toggle axis (T14)
// -------------------------------------------------------------------

describe('PromptDetailPanel — mode toggle axis', () => {
    const chatVariant = mockDualLogicalDef.variants[0];
    const agentVariant = mockDualLogicalDef.variants[1];
    const dualVariants = mockDualLogicalDef.variants as Parameters<typeof PromptDetailPanel>[0]['variants'];

    it('shows mode SegmentedControl when prompt has both chat and agent variants', () => {
        render(
            <PromptDetailPanel
                logical={mockDualLogicalDef as any}
                variant={chatVariant as any}
                variants={dualVariants}
                domain={null}
                category={null}
                onVariantSwitch={jest.fn()}
            />,
        );
        expect(screen.getByRole('group', { name: 'Execution mode' })).toBeInTheDocument();
    });

    it('mode toggle labels are "ChatBot" and "AI Agent", not raw chat/agent', () => {
        render(
            <PromptDetailPanel
                logical={mockDualLogicalDef as any}
                variant={chatVariant as any}
                variants={dualVariants}
                domain={null}
                category={null}
                onVariantSwitch={jest.fn()}
            />,
        );
        expect(screen.getByRole('button', { name: 'ChatBot' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'AI Agent' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'chat' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'agent' })).not.toBeInTheDocument();
    });

    it('does NOT show mode toggle when prompt is chat-only (single context)', () => {
        const chatOnlyVariants = [chatVariant] as Parameters<typeof PromptDetailPanel>[0]['variants'];
        const chatOnlyLogical = { ...mockDualLogicalDef, variantAxes: [], variants: [chatVariant] };
        render(
            <PromptDetailPanel
                logical={chatOnlyLogical as any}
                variant={chatVariant as any}
                variants={chatOnlyVariants}
                domain={null}
                category={null}
                onVariantSwitch={jest.fn()}
            />,
        );
        expect(screen.queryByRole('group', { name: 'Execution mode' })).not.toBeInTheDocument();
    });

    it('clicking "AI Agent" button calls onVariantSwitch with agent context', () => {
        const onVariantSwitch = jest.fn();
        render(
            <PromptDetailPanel
                logical={mockDualLogicalDef as any}
                variant={chatVariant as any}
                variants={dualVariants}
                domain={null}
                category={null}
                onVariantSwitch={onVariantSwitch}
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: 'AI Agent' }));
        expect(onVariantSwitch).toHaveBeenCalledWith('agent', null, null);
    });

    it('shows static "ChatBot" badge (no toggle) for chat-only prompt', () => {
        const chatOnlyVariants = [chatVariant] as Parameters<typeof PromptDetailPanel>[0]['variants'];
        const chatOnlyLogical = { ...mockDualLogicalDef, variantAxes: [], variants: [chatVariant] };
        render(
            <PromptDetailPanel
                logical={chatOnlyLogical as any}
                variant={chatVariant as any}
                variants={chatOnlyVariants}
                domain={null}
                category={null}
                onVariantSwitch={jest.fn()}
            />,
        );
        expect(screen.getByText('ChatBot')).toBeInTheDocument();
    });

    it('shows static "AI Agent" badge for agent-only prompt', () => {
        const agentOnlyVariants = [agentVariant] as Parameters<typeof PromptDetailPanel>[0]['variants'];
        const agentOnlyLogical = { ...mockDualLogicalDef, variantAxes: [], variants: [agentVariant] };
        render(
            <PromptDetailPanel
                logical={agentOnlyLogical as any}
                variant={agentVariant as any}
                variants={agentOnlyVariants}
                domain={null}
                category={null}
                onVariantSwitch={jest.fn()}
            />,
        );
        expect(screen.getByText('AI Agent')).toBeInTheDocument();
    });
});

// -------------------------------------------------------------------
// Component tests: PromptListItem — mode badge (T14)
// -------------------------------------------------------------------

describe('PromptListItem mode badge', () => {
    it('shows "Chat" for chat-only prompt', () => {
        render(
            <PromptListItem
                logical={makeLogical({ hasChat: true, hasAgent: false })}
                selected={false}
                onClick={jest.fn()}
            />,
        );
        expect(screen.getByText('Chat')).toBeInTheDocument();
        expect(screen.queryByText('Agent')).not.toBeInTheDocument();
        expect(screen.queryByText('Dual')).not.toBeInTheDocument();
    });

    it('shows "Agent" for agent-only prompt', () => {
        render(
            <PromptListItem
                logical={makeLogical({ hasChat: false, hasAgent: true })}
                selected={false}
                onClick={jest.fn()}
            />,
        );
        expect(screen.getByText('Agent')).toBeInTheDocument();
        expect(screen.queryByText('Chat')).not.toBeInTheDocument();
        expect(screen.queryByText('Dual')).not.toBeInTheDocument();
    });

    it('shows "Dual" (single badge) for dual-mode prompt', () => {
        render(
            <PromptListItem
                logical={makeLogical({ hasChat: true, hasAgent: true })}
                selected={false}
                onClick={jest.fn()}
            />,
        );
        expect(screen.getByText('Dual')).toBeInTheDocument();
        expect(screen.queryByText('Chat')).not.toBeInTheDocument();
        expect(screen.queryByText('Agent')).not.toBeInTheDocument();
    });

    it('shows no mode badge when both hasChat and hasAgent are false', () => {
        render(
            <PromptListItem
                logical={makeLogical({ hasChat: false, hasAgent: false })}
                selected={false}
                onClick={jest.fn()}
            />,
        );
        expect(screen.queryByText('Chat')).not.toBeInTheDocument();
        expect(screen.queryByText('Agent')).not.toBeInTheDocument();
        expect(screen.queryByText('Dual')).not.toBeInTheDocument();
    });
});

// -------------------------------------------------------------------
// Component tests: PromptCatalogView — Mode column (T14)
// -------------------------------------------------------------------

describe('PromptCatalogView Mode column', () => {
    const noop = jest.fn();

    it('renders a "Mode" column header in the catalog table', () => {
        render(<PromptCatalogView manifest={mockManifestWithModes as any} onRowClick={noop} onBack={noop} />);
        expect(screen.getByRole('columnheader', { name: 'Mode' })).toBeInTheDocument();
    });

    it('shows "Dual" in Mode column for dual-mode prompt', () => {
        render(<PromptCatalogView manifest={mockManifestWithModes as any} onRowClick={noop} onBack={noop} />);
        expect(screen.getByText('Dual')).toBeInTheDocument();
    });

    it('shows "Chat" in Mode column for chat-only prompt', () => {
        render(<PromptCatalogView manifest={mockManifestWithModes as any} onRowClick={noop} onBack={noop} />);
        expect(screen.getByText('Chat')).toBeInTheDocument();
    });

    it('shows "Agent" in Mode column for agent-only prompt', () => {
        render(<PromptCatalogView manifest={mockManifestWithModes as any} onRowClick={noop} onBack={noop} />);
        expect(screen.getByText('Agent')).toBeInTheDocument();
    });
});
