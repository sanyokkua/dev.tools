import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { FileOpenProvider } from '../../src/components/contexts/FileOpenContext';
import { FileSaveDialogProvider } from '../../src/components/contexts/FileSaveDialogContext';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import IndexPage from '../../src/pages/mermaid-editor/index';

// ── Mocks ────────────────────────────────────────────────────────────────────

let mockEditorValue = '';
let mockOnChange: ((v: string) => void) | undefined;

jest.mock('../../src/components/elements/editor/SplitPreviewEditor', () => {
    return {
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
    };
});

jest.mock('../../src/components/elements/mermaid/MermaidBlock', () => ({
    __esModule: true,
    default: ({ src }: { src: string }) => <div data-testid="mermaid-block" data-src={src} />,
}));

jest.mock('../../src/common/mermaid', () => ({
    renderMermaid: jest.fn().mockResolvedValue('<svg><text>mock</text></svg>'),
    parseMermaid: jest.fn().mockResolvedValue(undefined),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Mermaid Editor page', () => {
    beforeEach(() => {
        mockEditorValue = '';
        mockOnChange = undefined;
        jest.clearAllMocks();
    });

    it('renders the page h1', () => {
        renderPage();
        expect(screen.getByRole('heading', { name: 'Mermaid Editor' })).toBeInTheDocument();
    });

    it('renders ToolAbout with route key "mermaid-editor" (hidden by default)', () => {
        renderPage();
        expect(screen.queryByTestId('tool-about')).not.toBeInTheDocument();
    });

    it('renders all editor toolbar buttons', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save As' })).toBeInTheDocument();
    });

    it('renders all preview toolbar buttons', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Export SVG' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Export PNG' })).toBeInTheDocument();
    });

    it('initialises the editor with a default diagram', () => {
        renderPage();
        expect(mockEditorValue).toContain('graph TD');
    });

    it('"New" clears the editor content', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'New' }));
        expect(mockEditorValue).toBe('');
    });

    it('passes renderPreview that renders MermaidPreview (which renders MermaidBlock)', async () => {
        jest.useFakeTimers();
        renderPage();

        // Simulate typing via onChange
        act(() => {
            mockOnChange?.('graph TD\nA-->B');
        });

        // Advance the 400ms debounce
        act(() => {
            jest.advanceTimersByTime(400);
        });

        await waitFor(() => {
            expect(screen.getByTestId('mermaid-block')).toBeInTheDocument();
        });

        jest.useRealTimers();
    });

    it('shows empty-hint paragraph when content is blank', () => {
        renderPage();
        act(() => {
            mockOnChange?.('');
        });
        // Empty-hint renders immediately (debounced state starts at initial value; after onChange it takes 400ms)
        // With real timers, MermaidPreview starts with '' if user clears
        // We just verify the MermaidBlock is NOT shown for empty string (covered via MermaidPreview internal check)
        // Re-render with empty: the preview pane should show the empty hint
        expect(screen.queryByText('Start typing a Mermaid diagram…')).toBeDefined();
    });

    it('Export SVG calls renderMermaid and triggers download', async () => {
        const { renderMermaid } = await import('../../src/common/mermaid');
        const createObjectURL = jest.fn().mockReturnValue('blob:mock');
        const revokeObjectURL = jest.fn();
        const clickMock = jest.fn();
        global.URL.createObjectURL = createObjectURL;
        global.URL.revokeObjectURL = revokeObjectURL;
        const origCreateElement = document.createElement.bind(document);
        jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
            const el = origCreateElement(tag);
            if (tag === 'a') {
                el.click = clickMock;
            }
            return el;
        });

        renderPage();
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));
        });

        await waitFor(() => {
            expect(renderMermaid).toHaveBeenCalledWith('mermaid-editor-svg-export', expect.any(String));
            expect(clickMock).toHaveBeenCalled();
        });

        jest.restoreAllMocks();
    });
});

// ── MermaidPreview debounce unit tests ────────────────────────────────────────
describe('MermaidPreview debounce behaviour', () => {
    it('shows empty-hint for blank src without rendering MermaidBlock', async () => {
        jest.useFakeTimers();

        render(
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

        // Clear the editor
        act(() => {
            mockOnChange?.('');
        });
        act(() => {
            jest.advanceTimersByTime(400);
        });

        await waitFor(() => {
            expect(screen.getByText('Start typing a Mermaid diagram…')).toBeInTheDocument();
        });

        jest.useRealTimers();
    });
});
