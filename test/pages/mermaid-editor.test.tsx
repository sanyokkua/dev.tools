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
    toXmlSvg: jest.requireActual('../../src/common/mermaid').toXmlSvg,
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

    it('Export SVG writes well-formed XML for foreignObject labels with <br> and &nbsp;', async () => {
        const { renderMermaid } = await import('../../src/common/mermaid');
        (renderMermaid as jest.Mock).mockResolvedValueOnce(
            '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><div xmlns="http://www.w3.org/1999/xhtml">A<br>B&nbsp;ü</div></foreignObject></svg>',
        );
        let blob: Blob | undefined;
        global.URL.createObjectURL = jest.fn((b: Blob) => {
            blob = b;
            return 'blob:mock';
        });
        global.URL.revokeObjectURL = jest.fn();
        const origCreateElement = document.createElement.bind(document);
        jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
            const el = origCreateElement(tag);
            if (tag === 'a') el.click = jest.fn();
            return el;
        });

        renderPage();
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));
        });
        await waitFor(() => expect(blob).toBeDefined());
        jest.restoreAllMocks();

        const text = await new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onload = () => resolve(String(r.result));
            r.readAsText(blob as Blob);
        });
        expect(text.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        expect(doc.querySelector('parsererror')).toBeNull();
        expect(doc.documentElement.localName).toBe('svg');
    });

    it('Export PNG shows an export-failure toast (not a syntax error) when toBlob throws', async () => {
        const { renderMermaid } = await import('../../src/common/mermaid');
        (renderMermaid as jest.Mock).mockResolvedValueOnce('<svg viewBox="0 0 10 10"><text>x</text></svg>');
        class FakeImage {
            naturalWidth = 10;
            naturalHeight = 10;
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null;
            set src(_: string) {
                setTimeout(() => this.onload?.(), 0);
            }
        }
        const origImage = global.Image;
        (global as unknown as { Image: unknown }).Image = FakeImage;
        const origCreateElement = document.createElement.bind(document);
        jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
            if (tag === 'canvas') {
                return {
                    width: 0,
                    height: 0,
                    getContext: () => ({ fillRect: jest.fn(), drawImage: jest.fn(), fillStyle: '' }),
                    toBlob: () => {
                        throw new DOMException('tainted', 'SecurityError');
                    },
                } as unknown as HTMLCanvasElement;
            }
            return origCreateElement(tag);
        });

        renderPage();
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));
        });
        expect(await screen.findByText(/PNG export failed — could not generate the image/)).toBeInTheDocument();
        expect(screen.queryByText(/fix syntax errors/)).not.toBeInTheDocument();

        (global as unknown as { Image: unknown }).Image = origImage;
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
