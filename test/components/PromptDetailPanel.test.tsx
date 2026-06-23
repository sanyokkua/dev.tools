import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Category, Domain, LogicalPromptDef, PromptVariant } from '../../src/common/prompts/model/types';
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

jest.mock('@/controls/SegmentedControl', () => ({
    __esModule: true,
    default: ({
        value,
        onChange,
        options,
        'aria-label': ariaLabel,
    }: {
        'value': string;
        'onChange': (v: string) => void;
        'options': { value: string; label: string }[];
        'aria-label'?: string;
    }) => (
        <div role="group" aria-label={ariaLabel}>
            {options.map((o) => (
                <button
                    key={o.value}
                    data-value={o.value}
                    aria-pressed={value === o.value}
                    onClick={() => onChange(o.value)}
                >
                    {o.label}
                </button>
            ))}
        </div>
    ),
}));

jest.mock('@/common/prompts/registries/models', () => ({
    MODELS: [
        { id: 'flux-2', label: 'FLUX.2', slug: 'flux-2', modality: ['image-gen'], defaults: {} },
        {
            id: 'nano-banana-pro',
            label: 'Nano Banana Pro',
            slug: 'nano-banana-pro',
            modality: ['image-gen', 'image-edit'],
            defaults: {},
        },
    ],
}));

// --- Fixtures ---

const dom: Domain = { code: 'A', slug: 'software-engineering', title: 'Software Engineering', description: '' };
const cat: Category = { code: 'A03', domainCode: 'A', slug: 'code-review', title: 'Code Review' };

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
            control: 'combobox',
            suggestedValues: ['TypeScript', 'Python', 'Go'],
            allowCustom: true,
            optional: false,
        },
        { name: 'task', optional: true, control: 'text' },
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

const logical: LogicalPromptDef = {
    id: 'LP-A03-gen',
    categoryCode: 'A03',
    title: 'Generate Code',
    description: '',
    variantAxes: [],
    variants: [variant],
    defaultVariantId: 'USR-A03-gen',
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
        expect(screen.getByText('ChatBot')).toBeInTheDocument();
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

    it('S4 parameters: combobox rendered for param with control=combobox', () => {
        setup();
        expect(screen.getAllByTestId('ecb')).toHaveLength(1); // only 'language' has control='combobox'
    });

    it('S4 parameters: plain input for param with control=text', () => {
        setup();
        // 'task' has control='text' — uses plain <input>
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

describe('PromptDetailPanel — meta-prompt guard note', () => {
    it('shows guard note when isMetaPrompt=true', () => {
        render(<PromptDetailPanel logical={logical} variant={metaVariant} domain={dom} category={cat} />);
        expect(screen.getByRole('note')).toBeInTheDocument();
    });

    it('guard note is NOT shown for non-meta variant', () => {
        render(<PromptDetailPanel logical={logical} variant={variant} domain={dom} category={cat} />);
        expect(screen.queryByRole('note')).not.toBeInTheDocument();
    });

    it('guard note is NOT shown when isMetaPrompt is false (no category-code fallback)', () => {
        const nonMetaVariant = { ...variant, isMetaPrompt: false };
        render(<PromptDetailPanel logical={logical} variant={nonMetaVariant} domain={dom} category={cat} />);
        expect(screen.queryByRole('note')).not.toBeInTheDocument();
    });

    it('guard note contains Step 1 and Step 2 instructions', () => {
        render(<PromptDetailPanel logical={logical} variant={metaVariant} domain={dom} category={cat} />);
        const note = screen.getByRole('note');
        expect(note).toHaveTextContent(/Step 1/i);
        expect(note).toHaveTextContent(/Step 2/i);
    });

    it('guard note appears before the parameters section', () => {
        render(<PromptDetailPanel logical={logical} variant={metaVariant} domain={dom} category={cat} />);
        const note = screen.getByRole('note');
        const params = screen.getByLabelText('Parameters');
        // compareDocumentPosition: 4 = note precedes params
        expect(note.compareDocumentPosition(params) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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

// --- T2.4 fixtures ---

const chatVariant: PromptVariant = {
    ...variant,
    id: 'USR-A03-gen-chat',
    executionContext: 'chat',
    parameters: [{ name: 'language', optional: false, control: 'text' }],
};

const agentVariant: PromptVariant = {
    ...variant,
    id: 'AGT-A03-gen',
    executionContext: 'agent',
    parameters: [
        { name: 'language', optional: false, control: 'text' },
        { name: 'repo_path', optional: false, control: 'text' },
    ],
};

const logicalMultiAxis: LogicalPromptDef = {
    id: 'LP-A03-gen-multi',
    categoryCode: 'A03',
    title: 'Generate Code',
    description: '',
    variantAxes: ['mode'],
    variants: [chatVariant, agentVariant],
    defaultVariantId: 'USR-A03-gen-chat',
};

const noOpSwitch = jest.fn();

describe('PromptDetailPanel — variant switcher (T2.4)', () => {
    beforeEach(() => noOpSwitch.mockClear());

    it('shows SegmentedControl for executionContext when axis has multiple values', () => {
        render(
            <PromptDetailPanel
                logical={logicalMultiAxis}
                variant={chatVariant}
                variants={[chatVariant, agentVariant]}
                domain={dom}
                category={cat}
                onVariantSwitch={noOpSwitch}
            />,
        );
        expect(screen.getByRole('group', { name: /execution mode/i })).toBeInTheDocument();
    });

    it('does NOT show executionContext control when single variant', () => {
        render(
            <PromptDetailPanel
                logical={{ ...logicalMultiAxis, variantAxes: [] }}
                variant={chatVariant}
                variants={[chatVariant]}
                domain={dom}
                category={cat}
                onVariantSwitch={noOpSwitch}
            />,
        );
        expect(screen.queryByRole('group', { name: /execution mode/i })).not.toBeInTheDocument();
    });

    it('switching to agent calls onVariantSwitch with agent context', () => {
        render(
            <PromptDetailPanel
                logical={logicalMultiAxis}
                variant={chatVariant}
                variants={[chatVariant, agentVariant]}
                domain={dom}
                category={cat}
                onVariantSwitch={noOpSwitch}
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: 'AI Agent' }));
        expect(noOpSwitch).toHaveBeenCalledWith('agent', null, null);
    });

    it('shows model select when model axis has multiple values', () => {
        const gptV = { ...chatVariant, id: 'gpt', model: 'gpt-4o' };
        const claudeV = { ...chatVariant, id: 'claude', model: 'claude-opus' };
        render(
            <PromptDetailPanel
                logical={{ ...logicalMultiAxis, variantAxes: ['model'] }}
                variant={gptV}
                variants={[gptV, claudeV]}
                domain={dom}
                category={cat}
                onVariantSwitch={noOpSwitch}
            />,
        );
        expect(screen.getByRole('combobox', { name: /target model/i })).toBeInTheDocument();
    });

    it('selecting a model calls onVariantSwitch with model value', () => {
        const gptV = { ...chatVariant, id: 'gpt', model: 'gpt-4o' };
        const claudeV = { ...chatVariant, id: 'claude', model: 'claude-opus' };
        render(
            <PromptDetailPanel
                logical={{ ...logicalMultiAxis, variantAxes: ['model'] }}
                variant={gptV}
                variants={[gptV, claudeV]}
                domain={dom}
                category={cat}
                onVariantSwitch={noOpSwitch}
            />,
        );
        fireEvent.change(screen.getByRole('combobox', { name: /target model/i }), { target: { value: 'claude-opus' } });
        expect(noOpSwitch).toHaveBeenCalledWith(null, 'claude-opus', null);
    });
});

describe('PromptDetailPanel — param preservation on variant switch (T2.4)', () => {
    it('preserves param values with matching names when variant switches', async () => {
        const { rerender } = render(
            <PromptDetailPanel
                logical={logicalMultiAxis}
                variant={chatVariant}
                variants={[chatVariant, agentVariant]}
                domain={dom}
                category={cat}
                onVariantSwitch={noOpSwitch}
            />,
        );
        // Fill 'language' param
        fireEvent.change(screen.getByLabelText('language'), { target: { value: 'TypeScript' } });
        expect(screen.getByLabelText('language')).toHaveValue('TypeScript');

        // Switch to agent variant (also has 'language' + adds 'repo_path')
        rerender(
            <PromptDetailPanel
                logical={logicalMultiAxis}
                variant={agentVariant}
                variants={[chatVariant, agentVariant]}
                domain={dom}
                category={cat}
                onVariantSwitch={noOpSwitch}
            />,
        );

        // 'language' value preserved
        await waitFor(() => {
            expect(screen.getByLabelText('language')).toHaveValue('TypeScript');
        });
    });

    it('resets params when a different logical prompt is selected', async () => {
        const differentLogical: LogicalPromptDef = { ...logicalMultiAxis, id: 'LP-B01-different' };
        const { rerender } = render(
            <PromptDetailPanel
                logical={logicalMultiAxis}
                variant={chatVariant}
                variants={[chatVariant]}
                domain={dom}
                category={cat}
                onVariantSwitch={noOpSwitch}
            />,
        );
        fireEvent.change(screen.getByLabelText('language'), { target: { value: 'TypeScript' } });

        rerender(
            <PromptDetailPanel
                logical={differentLogical}
                variant={{ ...chatVariant, parameters: [{ name: 'language', optional: false, control: 'text' }] }}
                variants={[chatVariant]}
                domain={dom}
                category={cat}
                onVariantSwitch={noOpSwitch}
            />,
        );

        await waitFor(() => {
            expect(screen.getByLabelText('language')).toHaveValue('');
        });
    });
});

describe('PromptDetailPanel — Share button (T2.4)', () => {
    const SHARE_PATH = '/prompts-collection?domain=eng&variant=chat';

    beforeEach(() => {
        window.history.pushState({}, '', SHARE_PATH);
    });

    it('renders Share button in detail panel', () => {
        render(
            <PromptDetailPanel
                logical={logical}
                variant={variant}
                variants={[variant]}
                domain={dom}
                category={cat}
                onVariantSwitch={noOpSwitch}
            />,
        );
        expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    });

    it('Share button copies window.location.href to clipboard', async () => {
        render(
            <PromptDetailPanel
                logical={logical}
                variant={variant}
                variants={[variant]}
                domain={dom}
                category={cat}
                onVariantSwitch={noOpSwitch}
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: /share/i }));
        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining(SHARE_PATH));
        });
    });

    it('Share button shows "Link copied!" toast', async () => {
        render(
            <PromptDetailPanel
                logical={logical}
                variant={variant}
                variants={[variant]}
                domain={dom}
                category={cat}
                onVariantSwitch={noOpSwitch}
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: /share/i }));
        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'Link copied!' }));
        });
    });
});

// --- T12 fixtures ---

const variantWithTextarea: PromptVariant = {
    ...variant,
    id: 'USR-A03-ta-test',
    template: 'Context: {{context}}.',
    parameters: [{ name: 'context', label: 'Code Context', control: 'textarea', optional: false }],
    examples: {},
    notes: undefined,
    keywords: [],
};

const variantWithSelect: PromptVariant = {
    ...variant,
    id: 'USR-A03-sel-test',
    template: 'Use {{output_format}}.',
    parameters: [{ name: 'output_format', control: 'select', valueSetId: 'output-format', optional: false }],
    examples: {},
    notes: undefined,
    keywords: [],
};

const variantWithOptionalSelect: PromptVariant = {
    ...variantWithSelect,
    id: 'USR-A03-sel-opt',
    parameters: [{ name: 'output_format', control: 'select', valueSetId: 'output-format', optional: true }],
};

describe('PromptDetailPanel — param control: textarea (T12)', () => {
    it('renders <textarea> for control=textarea', () => {
        render(<PromptDetailPanel logical={logical} variant={variantWithTextarea} domain={dom} category={cat} />);
        expect(screen.getByRole('textbox', { name: 'Code Context' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Code Context' }).tagName.toLowerCase()).toBe('textarea');
    });

    it('textarea id is linked to its label via htmlFor', () => {
        render(<PromptDetailPanel logical={logical} variant={variantWithTextarea} domain={dom} category={cat} />);
        const label = screen.getByText('Code Context').closest('label');
        expect(label).toHaveAttribute('for', 'param-context');
        expect(screen.getByRole('textbox', { name: 'Code Context' })).toHaveAttribute('id', 'param-context');
    });

    it('typing in textarea updates the preview', () => {
        render(<PromptDetailPanel logical={logical} variant={variantWithTextarea} domain={dom} category={cat} />);
        fireEvent.change(screen.getByRole('textbox', { name: 'Code Context' }), { target: { value: 'my code' } });
        expect(screen.getByLabelText('Prompt')).toHaveTextContent('Context: my code.');
    });

    it('copy after textarea fill copies filled text', async () => {
        render(<PromptDetailPanel logical={logical} variant={variantWithTextarea} domain={dom} category={cat} />);
        fireEvent.change(screen.getByRole('textbox', { name: 'Code Context' }), { target: { value: 'my code' } });
        fireEvent.click(screen.getByRole('button', { name: /Copy prompt/i }));
        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Context: my code.');
        });
    });
});

describe('PromptDetailPanel — param control: select (T12)', () => {
    it('renders <select> for control=select + valueSetId', () => {
        render(<PromptDetailPanel logical={logical} variant={variantWithSelect} domain={dom} category={cat} />);
        // Select renders a native <select> (role=combobox)
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('select shows options from the value-set (PlainText, Markdown)', () => {
        render(<PromptDetailPanel logical={logical} variant={variantWithSelect} domain={dom} category={cat} />);
        expect(screen.getByRole('option', { name: 'PlainText' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Markdown' })).toBeInTheDocument();
    });

    it('optional select has blank — first option', () => {
        render(<PromptDetailPanel logical={logical} variant={variantWithOptionalSelect} domain={dom} category={cat} />);
        const options = screen.getAllByRole('option');
        expect(options[0]).toHaveTextContent('—');
    });

    it('non-optional select initializes to first value-set value', async () => {
        render(<PromptDetailPanel logical={logical} variant={variantWithSelect} domain={dom} category={cat} />);
        await waitFor(() => {
            expect(screen.getByRole('combobox')).toHaveValue('PlainText');
        });
    });
});

// --- T13 fixtures ---

const fluxV: PromptVariant = { ...chatVariant, id: 'flux', model: 'flux-2' };
const nanoV: PromptVariant = { ...chatVariant, id: 'nano', model: 'nano-banana-pro' };
const modelLogical: LogicalPromptDef = { ...logicalMultiAxis, variantAxes: ['model'] };

describe('PromptDetailPanel — model Select shows registry labels (T13)', () => {
    beforeEach(() => noOpSwitch.mockClear());

    it('shows registry label instead of raw model ID', () => {
        render(
            <PromptDetailPanel
                logical={modelLogical}
                variant={fluxV}
                variants={[fluxV, nanoV]}
                domain={dom}
                category={cat}
                onVariantSwitch={noOpSwitch}
            />,
        );
        expect(screen.getByRole('option', { name: 'FLUX.2' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Nano Banana Pro' })).toBeInTheDocument();
    });

    it('falls back to raw id when model is not in registry', () => {
        const unknownV: PromptVariant = { ...chatVariant, id: 'u1', model: 'unknown-model-x' };
        const knownV: PromptVariant = { ...chatVariant, id: 'u2', model: 'flux-2' };
        render(
            <PromptDetailPanel
                logical={modelLogical}
                variant={unknownV}
                variants={[unknownV, knownV]}
                domain={dom}
                category={cat}
                onVariantSwitch={noOpSwitch}
            />,
        );
        expect(screen.getByRole('option', { name: 'unknown-model-x' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'FLUX.2' })).toBeInTheDocument();
    });

    it('Select is hidden when only one model variant', () => {
        render(
            <PromptDetailPanel
                logical={modelLogical}
                variant={fluxV}
                variants={[fluxV]}
                domain={dom}
                category={cat}
                onVariantSwitch={noOpSwitch}
            />,
        );
        expect(screen.queryByRole('combobox', { name: /target model/i })).not.toBeInTheDocument();
    });

    it('selecting a model via Select calls onVariantSwitch with model id', () => {
        render(
            <PromptDetailPanel
                logical={modelLogical}
                variant={fluxV}
                variants={[fluxV, nanoV]}
                domain={dom}
                category={cat}
                onVariantSwitch={noOpSwitch}
            />,
        );
        fireEvent.change(screen.getByRole('combobox', { name: /target model/i }), {
            target: { value: 'nano-banana-pro' },
        });
        expect(noOpSwitch).toHaveBeenCalledWith(null, 'nano-banana-pro', null);
    });
});
