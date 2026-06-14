import { fireEvent, render, screen } from '@testing-library/react';
import { FileOpenProvider } from '../../src/components/contexts/FileOpenContext';
import { FileSaveDialogProvider } from '../../src/components/contexts/FileSaveDialogContext';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import IndexPage from '../../src/pages/code-editor/index';

jest.mock('../../src/components/elements/editor/CodeEditor', () => ({
    __esModule: true,
    default: ({ languageId }: { languageId?: string }) => (
        <div data-testid="code-editor" data-language={languageId ?? 'typescript'} />
    ),
}));

function renderPage(): ReturnType<typeof render> {
    return render(
        <ToasterProvider>
            <PageProvider>
                <FileOpenProvider>
                    <FileSaveDialogProvider>
                        <IndexPage />
                    </FileSaveDialogProvider>
                </FileOpenProvider>
            </PageProvider>
        </ToasterProvider>,
    );
}

describe('Code Editor page', () => {
    it('renders the Monaco editor', () => {
        renderPage();
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    });

    it('renders New, Open and Save buttons', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('renders Copy, Paste and Clear buttons', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Paste' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    });

    it('renders all 10 common language buttons', () => {
        renderPage();
        ['TS', 'JS', 'Java', 'Go', 'Python', 'Markdown', 'Shell', 'YAML', 'JSON', 'XML'].forEach((label) => {
            expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
        });
    });

    it('TS button is aria-pressed=true by default (initial language is typescript)', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'TS' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('other common language buttons are aria-pressed=false by default', () => {
        renderPage();
        ['JS', 'Java', 'Go', 'Python', 'Markdown', 'Shell', 'YAML', 'JSON', 'XML'].forEach((label) => {
            expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false');
        });
    });

    it('clicking a different common language button updates aria-pressed', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'JSON' }));
        expect(screen.getByRole('button', { name: 'JSON' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'TS' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('renders "More languages…" select with a placeholder option', () => {
        renderPage();
        const select = screen.getByRole('combobox', { name: 'More languages' });
        expect(select).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'More languages…' })).toBeInTheDocument();
    });

    it('renders Wrap and Minimap switches', () => {
        renderPage();
        expect(screen.getByRole('switch', { name: /wrap/i })).toBeInTheDocument();
        expect(screen.getByRole('switch', { name: /minimap/i })).toBeInTheDocument();
    });

    it('Wrap switch is off by default (aria-checked=false)', () => {
        renderPage();
        expect(screen.getByRole('switch', { name: /wrap/i })).toHaveAttribute('aria-checked', 'false');
    });

    it('Minimap switch is on by default (aria-checked=true)', () => {
        renderPage();
        expect(screen.getByRole('switch', { name: /minimap/i })).toHaveAttribute('aria-checked', 'true');
    });

    it('clicking Wrap switch toggles aria-checked', () => {
        renderPage();
        const wrapSwitch = screen.getByRole('switch', { name: /wrap/i });
        fireEvent.click(wrapSwitch);
        expect(wrapSwitch).toHaveAttribute('aria-checked', 'true');
    });

    it('renders the status bar', () => {
        renderPage();
        expect(screen.getByText('Ln 1, Col 1')).toBeInTheDocument();
        expect(screen.getByText('LF')).toBeInTheDocument();
        expect(screen.getByText(/Spaces: 2/)).toBeInTheDocument();
    });
});
