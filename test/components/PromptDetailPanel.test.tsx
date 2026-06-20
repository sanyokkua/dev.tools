import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Category, Domain, LogicalPrompt, PromptVariant } from '../../src/common/prompts/types';
import PromptDetailPanel from '../../src/components/page-specific/prompts-collection/PromptDetailPanel';

// --- Mocks ---

const mockShowToast = jest.fn();
jest.mock('@/contexts/ToasterContext', () => ({ useToast: () => ({ showToast: mockShowToast }) }));

jest.mock('@/common/prompts/data', () => ({
    replaceParams: (template: string, values: Record<string, string>) =>
        template.replace(/\{\{(\w+)\}\}/g, (_: string, key: string) => values[key] ?? `{{${key}}}`),
    buildSysPromptHref: (sysId: string, domain: string, cat: string, base = '') =>
        `${base}/prompts-collection?domain=${domain}&category=${cat}&prompt=${sysId}`,
}));

// EditableCombobox renders as a plain input for test simplicity
jest.mock('@/controls/EditableCombobox', () => ({
    __esModule: true,
    default: ({
        value,
        onChange,
        id,
        'aria-label': ariaLabel,
    }: {
        'value': string;
        'onChange': (v: string) => void;
        'id'?: string;
        'aria-label'?: string;
    }) => (
        <input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={ariaLabel}
            data-testid="ecb"
        />
    ),
}));

// --- Fixtures ---

const dom: Domain = { code: 'A', slug: 'software-engineering', title: 'Software Engineering', description: '' };
const cat: Category = { code: 'A03', domainCode: 'A', slug: 'code-review', title: 'Code Review' };
const logical: LogicalPrompt = {
    id: 'LP-A03-gen',
    categoryCode: 'A03',
    title: 'Generate Code',
    description: '',
    variantAxes: [],
    variantIds: ['USR-A03-gen'],
    defaultVariantId: 'USR-A03-gen',
};

const variant: PromptVariant = {
    id: 'USR-A03-gen',
    kind: 'user',
    categoryCode: 'A03',
    title: 'Generate Code',
    description: 'Generates code in a given language.',
    template: 'Write {{language}} code for {{task}}.',
    parameters: [
        {
            name: 'language',
            description: 'Programming language to use.',
            suggestedValues: ['TypeScript', 'Python', 'Go'],
            allowCustom: true,
            optional: false,
        },
        { name: 'task', optional: true },
    ],
    examples: { language: ['TypeScript', 'Python'] },
    notes: 'Be specific about the task.',
    keywords: ['code', 'generation'],
    executionContext: 'chat',
    isMetaPrompt: false,
    model: null,
    subVariant: null,
    recommendedSystemPromptId: 'SYS-A03-code-review',
};

const metaVariant: PromptVariant = {
    ...variant,
    id: 'USR-D01-prompter',
    categoryCode: 'D01',
    isMetaPrompt: true,
    recommendedSystemPromptId: null,
};

beforeEach(() => {
    mockShowToast.mockClear();
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: jest.fn().mockResolvedValue(undefined) },
        configurable: true,
    });
});

// --- Tests ---

describe('PromptDetailPanel — empty state', () => {
    it('shows status message when variant is null', () => {
        render(<PromptDetailPanel logical={null} variant={null} domain={dom} category={cat} />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows status message when logical is null but variant is also null', () => {
        render(<PromptDetailPanel logical={null} variant={null} domain={dom} category={cat} />);
        expect(screen.getByRole('status')).toHaveTextContent(/select a prompt/i);
    });
});

describe('PromptDetailPanel — 8 sections render', () => {
    function setup() {
        return render(<PromptDetailPanel logical={logical} variant={variant} domain={dom} category={cat} />);
    }

    it('S1 header: renders title and breadcrumb with variant ID', () => {
        setup();
        expect(screen.getByRole('heading', { name: 'Generate Code' })).toBeInTheDocument();
        expect(screen.getByText('USR-A03-gen')).toBeInTheDocument();
        expect(screen.getByText(/Software Engineering/)).toBeInTheDocument();
    });

    it('S1 header: shows chat tag', () => {
        setup();
        expect(screen.getByText('chat')).toBeInTheDocument();
    });

    it('S2 description: renders variant description', () => {
        setup();
        expect(screen.getByText('Generates code in a given language.')).toBeInTheDocument();
    });

    it('S3 prompt: renders prompt section heading', () => {
        setup();
        expect(screen.getByLabelText('Prompt')).toBeInTheDocument();
    });

    it('S4 parameters: renders param section with per-param help', () => {
        setup();
        expect(screen.getByLabelText('Parameters')).toBeInTheDocument();
        expect(screen.getByText('Programming language to use.')).toBeInTheDocument();
    });

    it('S4 parameters: combobox rendered for param with suggestedValues', () => {
        setup();
        expect(screen.getAllByTestId('ecb')).toHaveLength(1); // only 'language' has suggestedValues
    });

    it('S4 parameters: plain input for param without suggestedValues', () => {
        setup();
        // 'task' has no suggestedValues — uses plain <input>
        expect(screen.getByLabelText('task')).toBeInTheDocument();
    });

    it('S4 parameters: optional param shows (optional) label', () => {
        setup();
        expect(screen.getByText('(optional)')).toBeInTheDocument();
    });

    it('S5 examples: renders example values section', () => {
        setup();
        expect(screen.getByLabelText('Examples')).toBeInTheDocument();
        expect(screen.getByText('TypeScript, Python')).toBeInTheDocument();
    });

    it('S6 notes: renders notes section', () => {
        setup();
        expect(screen.getByLabelText('Notes')).toBeInTheDocument();
        expect(screen.getByText('Be specific about the task.')).toBeInTheDocument();
    });

    it('S7 keywords: renders keyword chips', () => {
        setup();
        expect(screen.getByLabelText('Keywords')).toBeInTheDocument();
        expect(screen.getByText('code')).toBeInTheDocument();
        expect(screen.getByText('generation')).toBeInTheDocument();
    });

    it('S8 META badge: shown for META variant', () => {
        render(<PromptDetailPanel logical={logical} variant={metaVariant} domain={dom} category={cat} />);
        expect(screen.getByText('⚗ Meta-prompt · outputs a prompt')).toBeInTheDocument();
    });

    it('S8 META badge: NOT shown for non-META variant', () => {
        setup();
        expect(screen.queryByText('⚗ Meta-prompt · outputs a prompt')).not.toBeInTheDocument();
    });
});

describe('PromptDetailPanel — system prompt tip', () => {
    it('shows system prompt tip when recommendedSystemPromptId is set', () => {
        render(<PromptDetailPanel logical={logical} variant={variant} domain={dom} category={cat} />);
        expect(screen.getByLabelText('System prompt')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Open/ })).toBeInTheDocument();
    });

    it('Open ↗ link has correct href', () => {
        render(<PromptDetailPanel logical={logical} variant={variant} domain={dom} category={cat} />);
        const link = screen.getByRole('link', { name: /Open/ });
        expect(link).toHaveAttribute(
            'href',
            '/prompts-collection?domain=software-engineering&category=code-review&prompt=SYS-A03-code-review',
        );
    });

    it('Open ↗ link opens in new tab', () => {
        render(<PromptDetailPanel logical={logical} variant={variant} domain={dom} category={cat} />);
        expect(screen.getByRole('link', { name: /Open/ })).toHaveAttribute('target', '_blank');
    });

    it('does NOT show system prompt tip when recommendedSystemPromptId is null', () => {
        const noSys = { ...variant, recommendedSystemPromptId: null };
        render(<PromptDetailPanel logical={logical} variant={noSys} domain={dom} category={cat} />);
        expect(screen.queryByRole('link', { name: /Open/ })).not.toBeInTheDocument();
    });

    it('does NOT show system prompt tip when logical=null (SYS variant itself)', () => {
        const sysVariant = { ...variant, kind: 'system' as const, recommendedSystemPromptId: null };
        render(<PromptDetailPanel logical={null} variant={sysVariant} domain={dom} category={cat} />);
        expect(screen.queryByRole('link', { name: /Open/ })).not.toBeInTheDocument();
    });
});

describe('PromptDetailPanel — copy actions', () => {
    it('Copy prompt button copies filled template to clipboard', async () => {
        render(<PromptDetailPanel logical={logical} variant={variant} domain={dom} category={cat} />);
        fireEvent.click(screen.getByRole('button', { name: /Copy prompt/i }));
        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                'Write  code for .', // all params blank → replaced with ''
            );
        });
    });

    it('Copy raw button copies raw template to clipboard', async () => {
        render(<PromptDetailPanel logical={logical} variant={variant} domain={dom} category={cat} />);
        fireEvent.click(screen.getByRole('button', { name: /Copy raw/i }));
        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Write {{language}} code for {{task}}.');
        });
    });

    it('Copy prompt after filling a param copies filled version', async () => {
        render(<PromptDetailPanel logical={logical} variant={variant} domain={dom} category={cat} />);
        // Fill the 'language' combobox (mocked as plain input with aria-label="language")
        fireEvent.change(screen.getByTestId('ecb'), { target: { value: 'TypeScript' } });
        fireEvent.click(screen.getByRole('button', { name: /Copy prompt/i }));
        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Write TypeScript code for .');
        });
    });

    it('Reset button clears all param values', () => {
        render(<PromptDetailPanel logical={logical} variant={variant} domain={dom} category={cat} />);
        fireEvent.change(screen.getByTestId('ecb'), { target: { value: 'TypeScript' } });
        fireEvent.click(screen.getByRole('button', { name: /Reset/i }));
        expect(screen.getByTestId('ecb')).toHaveValue('');
    });

    it('Copy success shows toast', async () => {
        render(<PromptDetailPanel logical={logical} variant={variant} domain={dom} category={cat} />);
        fireEvent.click(screen.getByRole('button', { name: /Copy prompt/i }));
        await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
        expect(mockShowToast.mock.calls[0][0]).toMatchObject({ type: 'success' });
    });
});

describe('PromptDetailPanel — optional param blank', () => {
    it('optional blank param produces clean output (no {{placeholder}})', async () => {
        render(<PromptDetailPanel logical={logical} variant={variant} domain={dom} category={cat} />);
        // Both params are '' by default — Copy prompt should have no placeholders
        fireEvent.click(screen.getByRole('button', { name: /Copy prompt/i }));
        await waitFor(() => {
            const written = (navigator.clipboard.writeText as jest.Mock).mock.calls[0][0] as string;
            expect(written).not.toMatch(/\{\{/);
        });
    });
});

describe('PromptDetailPanel — renders with logical=null (SYS deep-link)', () => {
    it('renders variant content when logical is null', () => {
        const sysVariant: PromptVariant = {
            ...variant,
            id: 'SYS-A03-code-review',
            kind: 'system',
            parameters: [],
            recommendedSystemPromptId: null,
        };
        render(<PromptDetailPanel logical={null} variant={sysVariant} domain={dom} category={cat} />);
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Generate Code' })).toBeInTheDocument();
    });
});
