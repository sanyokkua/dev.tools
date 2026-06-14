import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { FileOpenProvider } from '../../src/components/contexts/FileOpenContext';
import { FileSaveDialogProvider } from '../../src/components/contexts/FileSaveDialogContext';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import JsonFormatterPage from '../../src/pages/json-formatter/JsonFormatterPage';

type ChangeListener = () => void;

interface MockEditor {
    getValue: () => string;
    setValue: (v: string) => void;
    onDidChangeModelContent: (cb: ChangeListener) => { dispose: () => void };
    _trigger: () => void;
}

const leftEditorHolder: { current: MockEditor | null } = { current: null };

jest.mock('../../src/components/elements/editor/CodeEditor', () => ({
    __esModule: true,
    default: ({
        onEditorMounted,
        isReadOnly,
    }: {
        onEditorMounted?: (props: { editor: MockEditor; supportedExtensions: string[] }) => void;
        isReadOnly?: boolean;
    }) => {
        React.useEffect(() => {
            let listener: ChangeListener | null = null;
            let value = '';
            const mock: MockEditor = {
                getValue: () => value,
                setValue: (v: string) => {
                    value = v;
                },
                onDidChangeModelContent: (cb: ChangeListener) => {
                    listener = cb;
                    return {
                        dispose: () => {
                            listener = null;
                        },
                    };
                },
                _trigger: () => {
                    listener?.();
                },
            };
            if (!isReadOnly) {
                leftEditorHolder.current = mock;
            }
            onEditorMounted?.({ editor: mock, supportedExtensions: ['.json'] });
        }, []);
        return <div data-testid="code-editor" />;
    },
}));

function renderPage(): ReturnType<typeof render> {
    return render(
        <ToasterProvider>
            <PageProvider>
                <FileOpenProvider>
                    <FileSaveDialogProvider>
                        <JsonFormatterPage />
                    </FileSaveDialogProvider>
                </FileOpenProvider>
            </PageProvider>
        </ToasterProvider>,
    );
}

describe('JsonFormatterPage', () => {
    beforeEach(() => {
        leftEditorHolder.current = null;
    });

    it('renders two .editorpane divs (left and right panes)', () => {
        const { container } = renderPage();
        const panes = container.querySelectorAll('.editorpane');
        expect(panes).toHaveLength(2);
    });

    it('wraps the middle column in .card.pad', () => {
        const { container } = renderPage();
        expect(container.querySelector('.card.pad')).toBeInTheDocument();
    });

    it('renders the JSON Formatter heading in the middle column', () => {
        renderPage();
        expect(screen.getByRole('heading', { name: 'JSON Formatter' })).toBeInTheDocument();
    });

    it('renders all action buttons', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Beautify' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Minify' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sort Keys (A→Z)' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Validate' })).toBeInTheDocument();
    });

    it('does not render .pill badge initially (no content)', () => {
        const { container } = renderPage();
        expect(container.querySelector('.pill')).not.toBeInTheDocument();
    });

    it('renders .pill.ok when left editor contains valid JSON', () => {
        const { container } = renderPage();
        const editor = leftEditorHolder.current!;
        act(() => {
            editor.setValue('{"key": "value"}');
            editor._trigger();
        });
        expect(container.querySelector('.pill.ok')).toBeInTheDocument();
        expect(container.querySelector('.pill.no')).not.toBeInTheDocument();
    });

    it('renders .pill.no when left editor contains invalid JSON', () => {
        const { container } = renderPage();
        const editor = leftEditorHolder.current!;
        act(() => {
            editor.setValue('{bad json}');
            editor._trigger();
        });
        expect(container.querySelector('.pill.no')).toBeInTheDocument();
        expect(container.querySelector('.json-error-msg')).toBeInTheDocument();
    });

    it('renders left pane inside first .editorpane and right pane in second', () => {
        const { container } = renderPage();
        const panes = container.querySelectorAll('.editorpane');
        expect(panes[0].querySelector('[data-testid="code-editor"]')).toBeInTheDocument();
        expect(panes[1].querySelector('[data-testid="code-editor"]')).toBeInTheDocument();
    });

    it('renders .eb divs (editor body) inside each .editorpane', () => {
        const { container } = renderPage();
        const panes = container.querySelectorAll('.editorpane');
        expect(panes[0].querySelector('.eb')).toBeInTheDocument();
        expect(panes[1].querySelector('.eb')).toBeInTheDocument();
    });

    it('does not use legacy .editor-fill class', () => {
        const { container } = renderPage();
        expect(container.querySelector('.editor-fill')).not.toBeInTheDocument();
    });

    it('does not use legacy .badge class', () => {
        const { container } = renderPage();
        expect(container.querySelector('.badge')).not.toBeInTheDocument();
    });

    it('renders Use as Input button in the right pane toolbar', () => {
        renderPage();
        expect(screen.getByRole('button', { name: /use as input/i })).toBeInTheDocument();
    });
});
