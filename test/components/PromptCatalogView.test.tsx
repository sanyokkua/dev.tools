import type { PromptsData, SkillsData } from '@/common/prompts/types';
import PromptCatalogView from '@/page-specific/prompts-collection/PromptCatalogView';
import { fireEvent, render, screen } from '@testing-library/react';

const FIXTURE_PROMPTS: PromptsData = {
    domains: [{ code: 'A', slug: 'software-engineering', title: 'Software Engineering', description: '' }],
    categories: [
        { code: 'A03', domainCode: 'A', slug: 'code-review', title: 'Code Review', recommendedSystemPromptId: null },
    ],
    logical: [
        {
            id: 'LP-A03-review-change',
            categoryCode: 'A03',
            title: 'Review a Change',
            description: '',
            variantAxes: ['executionContext'],
            defaultVariantId: 'USR-A03-review-change',
            variantIds: ['USR-A03-review-change', 'AGT-A03-review-changes'],
        },
    ],
    variants: [
        {
            id: 'USR-A03-review-change',
            kind: 'user',
            categoryCode: 'A03',
            title: 'Review a Change',
            description: '',
            template: 'Review {{code}}',
            isMetaPrompt: false,
            executionContext: 'chat',
            model: null,
            subVariant: null,
            parameters: [],
            keywords: ['code review'],
        },
        {
            id: 'AGT-A03-review-changes',
            kind: 'agent',
            categoryCode: 'A03',
            title: 'Review a Change',
            description: '',
            template: 'Review {{code}}',
            isMetaPrompt: false,
            executionContext: 'agent',
            model: null,
            subVariant: null,
            parameters: [],
            keywords: [],
        },
    ],
};

const FIXTURE_SKILLS: SkillsData = {
    skills: [
        {
            id: 'SKILL-code-review',
            slug: 'code-review',
            domainCode: 'A',
            title: 'code-review',
            version: '1.0.0',
            description: 'Reviews code',
            tags: [],
            allowedTools: ['Read', 'Grep'],
            relatedSkillIds: [],
            files: [{ path: 'SKILL.md', role: 'skill', content: '# skill' }],
        },
    ],
};

const mockShowToast = jest.fn();
jest.mock('@/contexts/ToasterContext', () => ({ useToast: () => ({ showToast: mockShowToast }) }));

describe('PromptCatalogView', () => {
    const onRowClick = jest.fn();
    const onBack = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the table with correct column headers', () => {
        render(
            <PromptCatalogView
                promptsData={FIXTURE_PROMPTS}
                skillsData={FIXTURE_SKILLS}
                onRowClick={onRowClick}
                onBack={onBack}
            />,
        );
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Domain → Category')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
        expect(screen.getByText('Variants')).toBeInTheDocument();
    });

    it('renders a row for the prompt and a row for the skill', () => {
        render(
            <PromptCatalogView
                promptsData={FIXTURE_PROMPTS}
                skillsData={FIXTURE_SKILLS}
                onRowClick={onRowClick}
                onBack={onBack}
            />,
        );
        expect(screen.getByText('Review a Change')).toBeInTheDocument();
        expect(screen.getByText('code-review')).toBeInTheDocument();
    });

    it('shows "direct" badge for non-meta prompt row', () => {
        render(
            <PromptCatalogView
                promptsData={FIXTURE_PROMPTS}
                skillsData={FIXTURE_SKILLS}
                onRowClick={onRowClick}
                onBack={onBack}
            />,
        );
        expect(screen.getByText('direct')).toBeInTheDocument();
    });

    it('shows skill badge for skill rows', () => {
        render(
            <PromptCatalogView
                promptsData={FIXTURE_PROMPTS}
                skillsData={FIXTURE_SKILLS}
                onRowClick={onRowClick}
                onBack={onBack}
            />,
        );
        expect(screen.getAllByText(/🧩/).length).toBeGreaterThan(0);
    });

    it('calls onRowClick with correct row when a row is clicked', () => {
        render(
            <PromptCatalogView
                promptsData={FIXTURE_PROMPTS}
                skillsData={FIXTURE_SKILLS}
                onRowClick={onRowClick}
                onBack={onBack}
            />,
        );
        const promptRow = screen.getByText('Review a Change').closest('tr')!;
        fireEvent.click(promptRow);
        expect(onRowClick).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'LP-A03-review-change', kind: 'prompt' }),
        );
    });

    it('calls onBack when Back button is clicked', () => {
        render(
            <PromptCatalogView
                promptsData={FIXTURE_PROMPTS}
                skillsData={FIXTURE_SKILLS}
                onRowClick={onRowClick}
                onBack={onBack}
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: /back/i }));
        expect(onBack).toHaveBeenCalled();
    });

    it('filters rows when text is typed in search input', () => {
        render(
            <PromptCatalogView
                promptsData={FIXTURE_PROMPTS}
                skillsData={FIXTURE_SKILLS}
                onRowClick={onRowClick}
                onBack={onBack}
            />,
        );
        const search = screen.getByPlaceholderText(/search/i);
        fireEvent.change(search, { target: { value: 'XYZNOTMATCH' } });
        expect(screen.queryByText('Review a Change')).not.toBeInTheDocument();
        expect(screen.queryByText('code-review')).not.toBeInTheDocument();
    });

    it('renders "Back" button and title', () => {
        render(
            <PromptCatalogView
                promptsData={FIXTURE_PROMPTS}
                skillsData={FIXTURE_SKILLS}
                onRowClick={onRowClick}
                onBack={onBack}
            />,
        );
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
        expect(screen.getByText(/All prompts/i)).toBeInTheDocument();
    });
});
