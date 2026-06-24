import { fireEvent, render, screen } from '@testing-library/react';
import { FileOpenProvider } from '../../src/components/contexts/FileOpenContext';
import { FileSaveDialogProvider } from '../../src/components/contexts/FileSaveDialogContext';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import IndexPage from '../../src/pages/string-utils/index';

jest.mock('../../src/components/elements/editor/CodeEditor', () => ({
    __esModule: true,
    default: () => <div data-testid="code-editor" />,
}));

function renderPage(): ReturnType<typeof render> {
    return render(
        <ToasterProvider>
            <FileOpenProvider>
                <FileSaveDialogProvider>
                    <PageProvider>
                        <IndexPage />
                    </PageProvider>
                </FileSaveDialogProvider>
            </FileOpenProvider>
        </ToasterProvider>,
    );
}

describe('String Utils page', () => {
    it('renders two code editors', () => {
        renderPage();
        expect(screen.getAllByTestId('code-editor')).toHaveLength(2);
    });

    it('renders the "Select Utils" heading', () => {
        renderPage();
        expect(screen.getByText('Select Utils')).toBeInTheDocument();
    });

    it('renders a group selector (more than one group present)', () => {
        renderPage();
        // ToolView renders a <select> when there is more than one group
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('group selector contains String Utils, Case Utils, and Line Utils options', () => {
        renderPage();
        const select = screen.getByRole('combobox');
        expect(select).toHaveTextContent('String Utils');
        expect(select).toHaveTextContent('Case Utils');
        expect(select).toHaveTextContent('Line Utils');
    });

    it('renders the search filter input', () => {
        renderPage();
        expect(screen.getByRole('textbox', { name: /filter functions/i })).toBeInTheDocument();
    });

    it('function buttons are visible for the first group (String Utils)', () => {
        renderPage();
        expect(screen.getAllByRole('button', { name: /slugify/i }).length).toBeGreaterThan(0);
    });

    it('switching to Case Utils shows case-related functions', () => {
        renderPage();
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'case-utils' } });
        expect(screen.getAllByRole('button', { name: /lower case/i }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole('button', { name: /upper case/i }).length).toBeGreaterThan(0);
    });

    it('switching to Line Utils shows line-related functions', () => {
        renderPage();
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'line-utils' } });
        expect(screen.getAllByRole('button', { name: /split/i }).length).toBeGreaterThan(0);
    });

    it('filter input narrows visible function buttons', () => {
        renderPage();
        // Switch to Case Utils first (more distinct names)
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'case-utils' } });
        const filterInput = screen.getByRole('textbox', { name: /filter functions/i });
        fireEvent.change(filterInput, { target: { value: 'snake' } });
        expect(screen.getAllByRole('button', { name: /snake/i }).length).toBeGreaterThan(0);
        expect(screen.queryByRole('button', { name: /^lower case$/i })).not.toBeInTheDocument();
    });

    it('renders Open, Paste, Copy, and Clear toolbar buttons', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Paste' })).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: 'Copy' })).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: 'Clear' })).toHaveLength(2);
    });

    it('renders Save and Use as Input buttons in the output toolbar', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /use as input/i })).toBeInTheDocument();
    });
});
