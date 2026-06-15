import { fireEvent, render, screen } from '@testing-library/react';
import { Prompt, PromptCategory, PromptType } from '../../src/common/prompts/prompts';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import IndexPage from '../../src/pages/prompts-collection/index';

// ─── Fixture data ─────────────────────────────────────────────────────────────

const FIXTURE_PROMPTS: Prompt[] = [
    {
        id: 'p-code-gen-1',
        type: PromptType.SYSTEM_PROMPT,
        category: PromptCategory.CODE_GENERATION,
        tags: ['code', 'generation'],
        template: 'Generate code for {{task}}.',
        description: 'Code generation helper',
    },
    {
        id: 'p-test-gen-1',
        type: PromptType.USER_PROMPT_PARAMETRIZED,
        category: PromptCategory.TEST_GENERATION,
        tags: ['test', 'unit'],
        template: 'Write tests for {{component}}.',
        description: 'Unit test generator',
        parameters: ['component'],
    },
    {
        id: 'p-security-1',
        type: PromptType.SYSTEM_PROMPT,
        category: PromptCategory.SECURITY_ANALYSIS,
        tags: ['security', 'audit'],
        template: 'Audit security of {{code}}.',
        description: 'Security audit prompt',
    },
];

function renderPage(prompts: Prompt[] = FIXTURE_PROMPTS): ReturnType<typeof render> {
    return render(
        <ToasterProvider>
            <PageProvider>
                <IndexPage prompts={prompts} />
            </PageProvider>
        </ToasterProvider>,
    );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Prompts Collection page — shell', () => {
    it('renders the filter bar', () => {
        renderPage();
        expect(screen.getByText('Category')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
        expect(screen.getByText('Tag')).toBeInTheDocument();
        expect(screen.getByText('Search description')).toBeInTheDocument();
    });

    it('renders a Reset button', () => {
        renderPage();
        expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('renders all fixture prompts in the list on load', () => {
        renderPage();
        expect(screen.getByText('Code generation helper')).toBeInTheDocument();
        expect(screen.getByText('Unit test generator')).toBeInTheDocument();
        expect(screen.getByText('Security audit prompt')).toBeInTheDocument();
    });

    it('shows the empty-detail placeholder when no prompt is selected', () => {
        renderPage();
        expect(screen.getByText(/select a prompt from the list/i)).toBeInTheDocument();
    });

    it('clicking a prompt row shows the detail panel', () => {
        renderPage();
        fireEvent.click(screen.getByText('Code generation helper'));
        // Detail panel should appear — the description should still be visible
        expect(screen.getAllByText(/code generation helper/i).length).toBeGreaterThan(0);
        // Empty placeholder should be gone
        expect(screen.queryByText(/select a prompt from the list/i)).not.toBeInTheDocument();
    });

    it('clicking the same prompt twice de-selects it and restores placeholder', () => {
        renderPage();
        const row = screen.getByText('Code generation helper');
        fireEvent.click(row);
        fireEvent.click(row);
        expect(screen.getByText(/select a prompt from the list/i)).toBeInTheDocument();
    });
});

describe('Prompts Collection page — search filtering', () => {
    it('typing in the description search box narrows the list', () => {
        renderPage();
        const searchInput = screen.getByPlaceholderText(/search…/i);
        fireEvent.change(searchInput, { target: { value: 'security' } });
        expect(screen.getByText('Security audit prompt')).toBeInTheDocument();
        expect(screen.queryByText('Code generation helper')).not.toBeInTheDocument();
        expect(screen.queryByText('Unit test generator')).not.toBeInTheDocument();
    });

    it('typing in the tag search box filters by tag', () => {
        renderPage();
        const tagInput = screen.getByPlaceholderText(/filter by tag/i);
        fireEvent.change(tagInput, { target: { value: 'unit' } });
        expect(screen.getByText('Unit test generator')).toBeInTheDocument();
        expect(screen.queryByText('Code generation helper')).not.toBeInTheDocument();
    });

    it('shows "No prompts match" message when filter returns nothing', () => {
        renderPage();
        const searchInput = screen.getByPlaceholderText(/search…/i);
        fireEvent.change(searchInput, { target: { value: 'zzznomatch999' } });
        expect(screen.getByText(/no prompts match/i)).toBeInTheDocument();
    });

    it('Reset button clears the description search and restores all prompts', () => {
        renderPage();
        const searchInput = screen.getByPlaceholderText(/search…/i);
        fireEvent.change(searchInput, { target: { value: 'security' } });
        expect(screen.queryByText('Code generation helper')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /reset/i }));
        expect(screen.getByText('Code generation helper')).toBeInTheDocument();
        expect(screen.getByText('Unit test generator')).toBeInTheDocument();
    });
});

describe('Prompts Collection page — empty prompts list', () => {
    it('shows "No prompts match" message when passed an empty array', () => {
        renderPage([]);
        expect(screen.getByText(/no prompts match/i)).toBeInTheDocument();
    });
});
