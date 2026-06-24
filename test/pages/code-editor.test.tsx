import { fireEvent, render, screen } from '@testing-library/react';
import { FileOpenProvider } from '../../src/components/contexts/FileOpenContext';
import { FileSaveDialogProvider } from '../../src/components/contexts/FileSaveDialogContext';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import CodeEditorToolbar from '../../src/components/elements/editor/CodeEditorToolbar';
import IndexPage from '../../src/pages/code-editor/index';

const noop = () => {};

jest.mock('../../src/components/elements/editor/CodeEditor', () => ({
    __esModule: true,
    default: ({ languageId }: { languageId?: string }) => (
        <div data-testid="code-editor" data-language={languageId ?? 'typescript'} />
    ),
}));

jest.mock('@/common/format-code', () => ({
    formatCode: jest.fn().mockResolvedValue('formatted'),
    isFormattable: jest.requireActual('@/common/format-code').isFormattable,
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

    it('renders Format button (enabled for default TypeScript language)', () => {
        renderPage();
        const btn = screen.getByRole('button', { name: 'Format' });
        expect(btn).toBeInTheDocument();
        expect(btn).not.toBeDisabled();
    });

    it('Format button becomes disabled after switching to Go (non-formattable)', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Go' }));
        expect(screen.getByRole('button', { name: 'Format' })).toBeDisabled();
    });

    it('Format button is enabled after switching to JSON (formattable)', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Go' }));
        fireEvent.click(screen.getByRole('button', { name: 'JSON' }));
        expect(screen.getByRole('button', { name: 'Format' })).not.toBeDisabled();
    });

    it('renders a "Save As" button in addition to "Save"', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save As' })).toBeInTheDocument();
    });

    it('clicking Save (no handle) opens the Save File dialog', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        expect(screen.getByText('Save File As')).toBeInTheDocument();
    });

    it('clicking Save As opens the Save File dialog', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Save As' }));
        expect(screen.getByText('Save File As')).toBeInTheDocument();
    });
});

const RUST_LANG = { id: 'rust', extensions: ['.rs'], aliases: ['Rust'], mimetypes: ['text/rust'] };

function renderToolbar(onLanguageSelected: (id: string) => void) {
    return render(
        <CodeEditorToolbar
            onFileNewClick={noop}
            onFileOpenClick={noop}
            onFileSaveClick={noop}
            onFileSaveAsClick={noop}
            onCopyClick={noop}
            onPasteClick={noop}
            onClearClick={noop}
            onFormatClick={noop}
            isFormattable={true}
            currentLanguageId="typescript"
            mappedLanguages={[RUST_LANG]}
            onLanguageSelected={onLanguageSelected}
            wordWrap={false}
            onWordWrapToggle={noop}
            minimap={false}
            onMinimapToggle={noop}
        />,
    );
}

describe('CodeEditorToolbar — handleSelectChange', () => {
    it('selecting a non-empty value from "More languages" select calls onLanguageSelected', () => {
        const onLanguageSelected = jest.fn();
        renderToolbar(onLanguageSelected);
        const select = screen.getByRole('combobox', { name: 'More languages' });
        fireEvent.change(select, { target: { value: 'rust' } });
        expect(onLanguageSelected).toHaveBeenCalledWith('rust');
    });

    it('selecting empty string from "More languages" select does not call onLanguageSelected', () => {
        const onLanguageSelected = jest.fn();
        renderToolbar(onLanguageSelected);
        const select = screen.getByRole('combobox', { name: 'More languages' });
        fireEvent.change(select, { target: { value: '' } });
        expect(onLanguageSelected).not.toHaveBeenCalled();
    });
});

describe('CodeEditorToolbar — Format button', () => {
    it('renders Format button as enabled when isFormattable=true', () => {
        renderToolbar(jest.fn());
        const btn = screen.getByRole('button', { name: 'Format' });
        expect(btn).toBeInTheDocument();
        expect(btn).not.toBeDisabled();
    });

    it('renders Format button as disabled when isFormattable=false', () => {
        render(
            <CodeEditorToolbar
                onFileNewClick={noop}
                onFileOpenClick={noop}
                onFileSaveClick={noop}
                onFileSaveAsClick={noop}
                onCopyClick={noop}
                onPasteClick={noop}
                onClearClick={noop}
                onFormatClick={noop}
                isFormattable={false}
                currentLanguageId="go"
                mappedLanguages={[]}
                onLanguageSelected={noop}
                wordWrap={false}
                onWordWrapToggle={noop}
                minimap={false}
                onMinimapToggle={noop}
            />,
        );
        expect(screen.getByRole('button', { name: 'Format' })).toBeDisabled();
    });

    it('calls onFormatClick when Format button is clicked', () => {
        const onFormatClick = jest.fn();
        render(
            <CodeEditorToolbar
                onFileNewClick={noop}
                onFileOpenClick={noop}
                onFileSaveClick={noop}
                onFileSaveAsClick={noop}
                onCopyClick={noop}
                onPasteClick={noop}
                onClearClick={noop}
                onFormatClick={onFormatClick}
                isFormattable={true}
                currentLanguageId="typescript"
                mappedLanguages={[]}
                onLanguageSelected={noop}
                wordWrap={false}
                onWordWrapToggle={noop}
                minimap={false}
                onMinimapToggle={noop}
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: 'Format' }));
        expect(onFormatClick).toHaveBeenCalledTimes(1);
    });
});
