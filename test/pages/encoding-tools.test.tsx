import { fireEvent, render, screen } from '@testing-library/react';
import { FileOpenProvider } from '../../src/components/contexts/FileOpenContext';
import { FileSaveDialogProvider } from '../../src/components/contexts/FileSaveDialogContext';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import EncodingToolsPage from '../../src/pages/encoding-tools/index';

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
                        <EncodingToolsPage />
                    </PageProvider>
                </FileSaveDialogProvider>
            </FileOpenProvider>
        </ToasterProvider>,
    );
}

describe('Encoding Tools page', () => {
    it('renders two code editors', () => {
        renderPage();
        expect(screen.getAllByTestId('code-editor')).toHaveLength(2);
    });

    it('renders the "Select Mode" heading', () => {
        renderPage();
        expect(screen.getByText('Select Mode')).toBeInTheDocument();
    });

    it('renders a group selector with Encoding Utils and Decoding Utils options', () => {
        renderPage();
        const select = screen.getByRole('combobox');
        expect(select).toHaveTextContent('Encoding Utils');
        expect(select).toHaveTextContent('Decoding Utils');
    });

    it('shows encoding function buttons by default', () => {
        renderPage();
        expect(screen.getAllByRole('button', { name: /encode/i }).length).toBeGreaterThan(0);
    });

    it('shows Encode Url, Encode Base64, Encode Base64Url, HTML Entities encode buttons', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Encode Url' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Encode Base64' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Encode Base64Url' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'HTML Entities encode' })).toBeInTheDocument();
    });

    it('switching to Decoding Utils shows decode function buttons', () => {
        renderPage();
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'decoding-utils' } });
        expect(screen.getByRole('button', { name: 'Decode Url' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Decode Base64' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Decode Base64Url' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'HTML Entities decode' })).toBeInTheDocument();
    });

    it('switching to Decoding Utils hides encode-only buttons', () => {
        renderPage();
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'decoding-utils' } });
        expect(screen.queryByRole('button', { name: 'Encode Url' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Encode Base64' })).not.toBeInTheDocument();
    });

    it('renders Open, Paste, Copy, and Clear toolbar buttons', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Paste' })).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: 'Copy' })).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: 'Clear' })).toHaveLength(2);
    });

    it('renders Save and Use as Input buttons', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /use as input/i })).toBeInTheDocument();
    });
});
