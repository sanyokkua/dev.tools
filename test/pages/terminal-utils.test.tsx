import { fireEvent, render, screen } from '@testing-library/react';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import IndexPage from '../../src/pages/terminal-utils/index';

jest.mock('../../src/components/elements/editor/CodeEditor', () => ({
    __esModule: true,
    default: ({ languageId }: { languageId?: string }) => (
        <div data-testid="code-editor" data-language={languageId ?? 'shell'} />
    ),
}));

function renderPage(): ReturnType<typeof render> {
    return render(
        <ToasterProvider>
            <PageProvider>
                <IndexPage />
            </PageProvider>
        </ToasterProvider>,
    );
}

describe('Terminal Utils page', () => {
    it('renders the page heading', () => {
        renderPage();
        expect(screen.getByRole('heading', { name: 'Terminal Utilities' })).toBeInTheDocument();
    });

    it('renders all three syntax buttons', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Unix bash' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Windows bat' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'PowerShell' })).toBeInTheDocument();
    });

    it('Unix bash button is selected by default (aria-pressed=true)', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Unix bash' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('Windows bat and PowerShell buttons are not selected by default', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Windows bat' })).toHaveAttribute('aria-pressed', 'false');
        expect(screen.getByRole('button', { name: 'PowerShell' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('clicking Windows bat selects it and deselects Unix bash', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Windows bat' }));
        expect(screen.getByRole('button', { name: 'Windows bat' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'Unix bash' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('renders the input pane label', () => {
        renderPage();
        expect(screen.getByText('Input (one command per line)')).toBeInTheDocument();
    });

    it('renders the result pane label', () => {
        renderPage();
        expect(screen.getByText('Result (single line)')).toBeInTheDocument();
    });

    it('renders two code editors', () => {
        renderPage();
        expect(screen.getAllByTestId('code-editor')).toHaveLength(2);
    });

    it('renders Paste, Clear, Join with & and Join with && buttons in the input pane', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Paste' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Join with &' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Join with &&' })).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: 'Clear' })).toHaveLength(2);
    });

    it('renders Copy button in the result pane', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    });
});
