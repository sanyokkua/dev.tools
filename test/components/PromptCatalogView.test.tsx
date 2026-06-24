import type { Manifest } from '@/common/prompts/model/types';
import PromptCatalogView from '@/page-specific/prompts-collection/PromptCatalogView';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const FIXTURE_MANIFEST: Manifest = {
    domains: [{ code: 'A', slug: 'software-engineering', title: 'Software Engineering', description: '' }],
    categories: [{ code: 'A03', domainCode: 'A', slug: 'code-review', title: 'Code Review' }],
    logical: [
        {
            id: 'LP-A03-review-change',
            categoryCode: 'A03',
            domainCode: 'A',
            title: 'Review a Change',
            description: '',
            keywords: ['code review'],
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
            fileCount: 1,
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
        render(<PromptCatalogView manifest={FIXTURE_MANIFEST} onRowClick={onRowClick} onBack={onBack} />);
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Domain → Category')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
        expect(screen.getByText('Variants')).toBeInTheDocument();
    });

    it('renders a row for the prompt and a row for the skill', () => {
        render(<PromptCatalogView manifest={FIXTURE_MANIFEST} onRowClick={onRowClick} onBack={onBack} />);
        expect(screen.getByText('Review a Change')).toBeInTheDocument();
        expect(screen.getByText('code-review')).toBeInTheDocument();
    });

    it('shows "direct" badge for non-meta prompt row', () => {
        render(<PromptCatalogView manifest={FIXTURE_MANIFEST} onRowClick={onRowClick} onBack={onBack} />);
        expect(screen.getByText('direct')).toBeInTheDocument();
    });

    it('shows skill badge for skill rows', () => {
        render(<PromptCatalogView manifest={FIXTURE_MANIFEST} onRowClick={onRowClick} onBack={onBack} />);
        expect(screen.getAllByText(/🧩/).length).toBeGreaterThan(0);
    });

    it('calls onRowClick with correct row when a row is clicked', () => {
        render(<PromptCatalogView manifest={FIXTURE_MANIFEST} onRowClick={onRowClick} onBack={onBack} />);
        const promptRow = screen.getByText('Review a Change').closest('tr')!;
        fireEvent.click(promptRow);
        expect(onRowClick).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'LP-A03-review-change', kind: 'prompt' }),
        );
    });

    it('calls onBack when Back button is clicked', () => {
        render(<PromptCatalogView manifest={FIXTURE_MANIFEST} onRowClick={onRowClick} onBack={onBack} />);
        fireEvent.click(screen.getByRole('button', { name: /back/i }));
        expect(onBack).toHaveBeenCalled();
    });

    it('filters rows when text is typed in search input', () => {
        render(<PromptCatalogView manifest={FIXTURE_MANIFEST} onRowClick={onRowClick} onBack={onBack} />);
        const search = screen.getByPlaceholderText(/search/i);
        fireEvent.change(search, { target: { value: 'XYZNOTMATCH' } });
        expect(screen.queryByText('Review a Change')).not.toBeInTheDocument();
        expect(screen.queryByText('code-review')).not.toBeInTheDocument();
    });

    it('renders "Back" button and title', () => {
        render(<PromptCatalogView manifest={FIXTURE_MANIFEST} onRowClick={onRowClick} onBack={onBack} />);
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
        expect(screen.getByText(/All prompts/i)).toBeInTheDocument();
    });
});

describe('PromptCatalogView — basePath URLs (T18)', () => {
    const originalBasePath = process.env.NEXT_PUBLIC_BASE_PATH;

    beforeEach(() => {
        jest.clearAllMocks();
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText: jest.fn().mockResolvedValue(undefined) },
            configurable: true,
        });
        process.env.NEXT_PUBLIC_BASE_PATH = '/dev-tools';
    });

    afterEach(() => {
        Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
        if (originalBasePath === undefined) {
            delete process.env.NEXT_PUBLIC_BASE_PATH;
        } else {
            process.env.NEXT_PUBLIC_BASE_PATH = originalBasePath;
        }
    });

    it('copy share for prompt row writes /dev-tools/prompts-collection?... to clipboard', async () => {
        render(<PromptCatalogView manifest={FIXTURE_MANIFEST} onRowClick={jest.fn()} onBack={jest.fn()} />);
        const shareButton = screen.getByRole('button', { name: /Copy link for Review a Change/i });
        fireEvent.click(shareButton);
        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('/dev-tools/prompts-collection'),
            );
        });
    });
});
