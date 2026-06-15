import { fireEvent, render, screen } from '@testing-library/react';
import { FileOpenProvider } from '../../src/components/contexts/FileOpenContext';
import { FileSaveDialogProvider } from '../../src/components/contexts/FileSaveDialogContext';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import IndexPage from '../../src/pages/markdown-tools/index';

jest.mock('../../src/components/elements/editor/CodeEditor', () => ({
    __esModule: true,
    default: ({ languageId }: { languageId?: string }) => (
        <div data-testid="code-editor" data-language={languageId ?? 'markdown'} />
    ),
}));

jest.mock('react-markdown', () => ({
    __esModule: true,
    default: ({ children }: { children: string }) => <div data-testid="react-markdown">{children}</div>,
}));

jest.mock('react-to-print', () => ({ useReactToPrint: () => jest.fn() }));

jest.mock('rehype-highlight', () => ({ __esModule: true, default: () => {} }));
jest.mock('rehype-katex', () => ({ __esModule: true, default: () => {} }));
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => {} }));
jest.mock('remark-math', () => ({ __esModule: true, default: () => {} }));
jest.mock('katex/dist/katex.min.css', () => ({}));

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

describe('Markdown Tools page', () => {
    it('renders the Monaco editor mock', () => {
        renderPage();
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    });

    it('renders New, Open and Save buttons', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('renders Copy and Paste buttons', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Paste' })).toBeInTheDocument();
    });

    it('renders Print / Export PDF button', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Print / Export PDF' })).toBeInTheDocument();
    });

    it('renders Editor, Preview, Wrap and Minimap switches', () => {
        renderPage();
        expect(screen.getByRole('switch', { name: /editor/i })).toBeInTheDocument();
        expect(screen.getByRole('switch', { name: /preview/i })).toBeInTheDocument();
        expect(screen.getByRole('switch', { name: /wrap/i })).toBeInTheDocument();
        expect(screen.getByRole('switch', { name: /minimap/i })).toBeInTheDocument();
    });

    it('Editor switch is on by default (aria-checked=true)', () => {
        renderPage();
        expect(screen.getByRole('switch', { name: /editor/i })).toHaveAttribute('aria-checked', 'true');
    });

    it('Preview switch is on by default (aria-checked=true)', () => {
        renderPage();
        expect(screen.getByRole('switch', { name: /preview/i })).toHaveAttribute('aria-checked', 'true');
    });

    it('Wrap switch is off by default (aria-checked=false)', () => {
        renderPage();
        expect(screen.getByRole('switch', { name: /wrap/i })).toHaveAttribute('aria-checked', 'false');
    });

    it('Minimap switch is on by default (aria-checked=true)', () => {
        renderPage();
        expect(screen.getByRole('switch', { name: /minimap/i })).toHaveAttribute('aria-checked', 'true');
    });

    it('clicking Show Editor switch toggles aria-checked', () => {
        renderPage();
        const editorSwitch = screen.getByRole('switch', { name: /editor/i });
        fireEvent.click(editorSwitch);
        expect(editorSwitch).toHaveAttribute('aria-checked', 'false');
    });

    it('clicking Show Preview switch toggles aria-checked', () => {
        renderPage();
        const previewSwitch = screen.getByRole('switch', { name: /preview/i });
        fireEvent.click(previewSwitch);
        expect(previewSwitch).toHaveAttribute('aria-checked', 'false');
    });

    it('info panel renders WordWrap, Minimap, MD Editor, MD Preview and FileName items', () => {
        renderPage();
        expect(screen.getByText(/WordWrap:/)).toBeInTheDocument();
        expect(screen.getByText(/Minimap:/)).toBeInTheDocument();
        expect(screen.getByText(/MD Editor:/)).toBeInTheDocument();
        expect(screen.getByText(/MD Preview:/)).toBeInTheDocument();
        expect(screen.getByText(/FileName:/)).toBeInTheDocument();
    });

    it('info row uses .card element not InformationPanel chips', () => {
        const { container } = renderPage();
        expect(container.querySelector('.info-panel')).toBeNull();
        expect(container.querySelector('.markdown-tools__info.card.pad')).toBeInTheDocument();
    });

    it('renders the page heading "Markdown Tools"', () => {
        renderPage();
        expect(screen.getByRole('heading', { name: /markdown tools/i })).toBeInTheDocument();
    });

    it('hides the Monaco editor when the Editor switch is toggled off', () => {
        renderPage();
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('switch', { name: /editor/i }));
        expect(screen.queryByTestId('code-editor')).not.toBeInTheDocument();
    });

    it('shows the Monaco editor when the Editor switch is toggled back on', () => {
        renderPage();
        const editorSwitch = screen.getByRole('switch', { name: /editor/i });
        fireEvent.click(editorSwitch); // off
        fireEvent.click(editorSwitch); // on
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    });

    it('hides the preview pane when the Preview switch is toggled off', () => {
        renderPage();
        expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('switch', { name: /preview/i }));
        expect(screen.queryByTestId('react-markdown')).not.toBeInTheDocument();
    });

    it('shows the preview pane when the Preview switch is toggled back on', () => {
        renderPage();
        const previewSwitch = screen.getByRole('switch', { name: /preview/i });
        fireEvent.click(previewSwitch); // off
        fireEvent.click(previewSwitch); // on
        expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
    });

    it('clicking Save opens the Save File dialog', () => {
        renderPage();
        expect(screen.queryByText('Save File As')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        expect(screen.getByText('Save File As')).toBeInTheDocument();
    });

    it('Save dialog offers .md and .txt extensions', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        const select = screen.getByRole<HTMLSelectElement>('combobox');
        const opts = Array.from(select.options).map((o) => o.value);
        expect(opts).toContain('.md');
        expect(opts).toContain('.txt');
    });
});
