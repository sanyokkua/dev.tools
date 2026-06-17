import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { FileOpenProvider } from '../../src/components/contexts/FileOpenContext';
import { FileSaveDialogProvider } from '../../src/components/contexts/FileSaveDialogContext';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import IndexPage from '../../src/pages/html-editor/index';

let mockEditorValue = '';
let mockOnChange: ((v: string) => void) | undefined;

jest.mock('../../src/components/elements/editor/SplitPreviewEditor', () => ({
    __esModule: true,
    default: ({
        value,
        onChange,
        renderPreview,
        editorToolbarChildren,
        previewToolbarChildren,
    }: {
        value: string;
        onChange?: (v: string) => void;
        renderPreview: (v: string) => React.ReactNode;
        editorToolbarChildren?: React.ReactNode;
        previewToolbarChildren?: React.ReactNode;
    }) => {
        mockEditorValue = value;
        mockOnChange = onChange;
        return (
            <div data-testid="split-preview-editor">
                <div data-testid="editor-toolbar">{editorToolbarChildren}</div>
                <div data-testid="preview-toolbar">{previewToolbarChildren}</div>
                <div data-testid="preview-pane">{renderPreview(value)}</div>
            </div>
        );
    },
}));

jest.mock('../../src/common/format-code', () => ({
    formatCode: jest.fn().mockResolvedValue('<html><body><p>formatted</p></body></html>'),
    isFormattable: jest.fn().mockReturnValue(true),
}));

function renderPage() {
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

describe('HTML Editor page', () => {
    beforeEach(() => {
        mockEditorValue = '';
        mockOnChange = undefined;
        jest.clearAllMocks();
    });

    it('renders ToolAbout (hidden by default)', () => {
        renderPage();
        expect(screen.queryByTestId('tool-about')).not.toBeInTheDocument();
    });

    it('renders all editor toolbar buttons', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save As' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Format' })).toBeInTheDocument();
    });

    it('renders Allow Scripts switch unchecked by default', () => {
        renderPage();
        const sw = screen.getByRole('switch');
        expect(sw).toBeInTheDocument();
        expect(sw).toHaveAttribute('aria-checked', 'false');
    });

    it('initialises editor with DEFAULT_HTML containing "<!DOCTYPE html>"', () => {
        renderPage();
        expect(mockEditorValue).toContain('<!DOCTYPE html>');
    });

    it('"New" clears editor content', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'New' }));
        expect(mockEditorValue).toBe('');
    });

    it('renders iframe with sandbox="allow-same-origin" by default', () => {
        renderPage();
        const iframe = screen.getByTitle('HTML Preview');
        expect(iframe).toHaveAttribute('sandbox', 'allow-same-origin');
    });

    it('iframe srcdoc reflects current editor content', () => {
        renderPage();
        const iframe = screen.getByTitle('HTML Preview');
        expect(iframe.getAttribute('srcdoc')).toContain('<!DOCTYPE html>');
    });

    it('shows empty-hint paragraph when content is blank', () => {
        renderPage();
        act(() => {
            mockOnChange?.('');
        });
        expect(screen.getByText('Start typing HTML…')).toBeInTheDocument();
    });

    it('toggling Allow Scripts changes iframe sandbox to "allow-scripts"', () => {
        renderPage();
        fireEvent.click(screen.getByRole('switch'));
        const iframe = screen.getByTitle('HTML Preview');
        expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
    });

    it('Format button calls formatCode("html", content)', async () => {
        const { formatCode } = await import('../../src/common/format-code');
        renderPage();
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Format' }));
        });
        await waitFor(() => {
            expect(formatCode).toHaveBeenCalledWith('html', expect.any(String));
        });
    });

    it('Format button skips formatCode when content is empty', async () => {
        const { formatCode } = await import('../../src/common/format-code');
        renderPage();
        act(() => {
            mockOnChange?.('');
        });
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Format' }));
        });
        expect(formatCode).not.toHaveBeenCalled();
    });
});
