jest.mock('../../src/common/xml-formatting-tools', () => ({
    validateXml: jest.fn().mockReturnValue({ valid: true }),
    formatXml: jest.fn().mockReturnValue('<root/>'),
    minifyXml: jest.fn().mockReturnValue('<root/>'),
    queryXPath: jest.fn().mockReturnValue({ type: 'nodes', nodes: [], count: 0 }),
}));

import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import * as xmlToolsModule from '../../src/common/xml-formatting-tools';
import { FileOpenProvider } from '../../src/components/contexts/FileOpenContext';
import { FileSaveDialogProvider } from '../../src/components/contexts/FileSaveDialogContext';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import XmlFormatterPage from '../../src/pages/xml-formatter/XmlFormatterPage';

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
            onEditorMounted?.({ editor: mock, supportedExtensions: ['.xml'] });
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
                        <XmlFormatterPage />
                    </FileSaveDialogProvider>
                </FileOpenProvider>
            </PageProvider>
        </ToasterProvider>,
    );
}

describe('XmlFormatterPage', () => {
    beforeEach(() => {
        leftEditorHolder.current = null;
        (xmlToolsModule.validateXml as jest.Mock).mockReturnValue({ valid: true });
    });

    it('renders two .editorpane divs', () => {
        const { container } = renderPage();
        const panes = container.querySelectorAll('.editorpane');
        expect(panes).toHaveLength(2);
    });

    it('wraps middle column in .card.pad', () => {
        const { container } = renderPage();
        expect(container.querySelector('.card.pad')).toBeInTheDocument();
    });

    it('renders Mode SegmentedControl', () => {
        renderPage();
        expect(screen.getByRole('group', { name: 'Mode' })).toBeInTheDocument();
    });

    it('renders Format mode buttons: Beautify, Minify, Validate', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Beautify' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Minify' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Validate' })).toBeInTheDocument();
    });

    it('does NOT render a Sort Keys button', () => {
        renderPage();
        expect(screen.queryByRole('button', { name: /sort keys/i })).not.toBeInTheDocument();
    });

    it('does NOT render .pill initially (no content)', () => {
        const { container } = renderPage();
        expect(container.querySelector('.pill')).not.toBeInTheDocument();
    });

    it('renders .pill.ok when editor has valid XML', () => {
        (xmlToolsModule.validateXml as jest.Mock).mockReturnValue({ valid: true });
        const { container } = renderPage();
        const editor = leftEditorHolder.current!;
        act(() => {
            editor.setValue('<root/>');
            editor._trigger();
        });
        expect(container.querySelector('.pill.ok')).toBeInTheDocument();
        expect(container.querySelector('.pill.no')).not.toBeInTheDocument();
    });

    it('renders .pill.no when editor has invalid XML', () => {
        (xmlToolsModule.validateXml as jest.Mock).mockReturnValue({
            valid: false,
            error: 'Parse error',
            line: 1,
            column: 5,
        });
        const { container } = renderPage();
        const editor = leftEditorHolder.current!;
        act(() => {
            editor.setValue('<unclosed');
            editor._trigger();
        });
        expect(container.querySelector('.pill.no')).toBeInTheDocument();
        expect(container.querySelector('.pill.ok')).not.toBeInTheDocument();
    });

    it('shows .json-error-msg on invalid XML', () => {
        (xmlToolsModule.validateXml as jest.Mock).mockReturnValue({
            valid: false,
            error: 'Parse error',
            line: 1,
            column: 5,
        });
        const { container } = renderPage();
        const editor = leftEditorHolder.current!;
        act(() => {
            editor.setValue('<unclosed');
            editor._trigger();
        });
        expect(container.querySelector('.json-error-msg')).toBeInTheDocument();
    });

    it('both .editorpane contain .eb with [data-testid="code-editor"]', () => {
        const { container } = renderPage();
        const panes = container.querySelectorAll('.editorpane');
        expect(panes[0].querySelector('.eb [data-testid="code-editor"]')).toBeInTheDocument();
        expect(panes[1].querySelector('.eb [data-testid="code-editor"]')).toBeInTheDocument();
    });

    it('renders Use as Input button in right pane toolbar', () => {
        renderPage();
        expect(screen.getByRole('button', { name: /use as input/i })).toBeInTheDocument();
    });
});

describe('XmlFormatterPage — Query mode', () => {
    beforeEach(() => {
        leftEditorHolder.current = null;
        (xmlToolsModule.validateXml as jest.Mock).mockReturnValue({ valid: true });
        (xmlToolsModule.queryXPath as jest.Mock).mockReturnValue({ type: 'nodes', nodes: [], count: 0 });
    });

    it('Mode SegmentedControl has Format and Query (XPath) options', () => {
        renderPage();
        expect(screen.getByRole('group', { name: 'Mode' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Format' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Query (XPath)' })).toBeInTheDocument();
    });

    it('defaults to Format mode (Beautify button visible)', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Beautify' })).toBeInTheDocument();
    });

    it('switching to Query (XPath) hides format buttons and shows XPath input', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Query (XPath)' }));
        expect(screen.queryByRole('button', { name: 'Beautify' })).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText('//element[@attr]')).toBeInTheDocument();
    });

    it('switching back to Format mode restores Beautify button', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Query (XPath)' }));
        fireEvent.click(screen.getByRole('button', { name: 'Format' }));
        expect(screen.getByRole('button', { name: 'Beautify' })).toBeInTheDocument();
        expect(screen.queryByPlaceholderText('//element[@attr]')).not.toBeInTheDocument();
    });

    it('query with empty input shows WARNING toast', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Query (XPath)' }));
        // editor is empty, clicking Run Query should trigger the "Nothing to query" warning
        fireEvent.click(screen.getByRole('button', { name: 'Run Query' }));
        // Toast with warning message should appear
        expect(screen.getByText('Nothing to query')).toBeInTheDocument();
    });

    it('query with results shows pill text', () => {
        (xmlToolsModule.queryXPath as jest.Mock).mockReturnValue({ type: 'nodes', nodes: ['<item/>'], count: 1 });
        const { container } = renderPage();
        const editor = leftEditorHolder.current!;
        act(() => {
            editor.setValue('<root><item/></root>');
        });
        fireEvent.click(screen.getByRole('button', { name: 'Query (XPath)' }));
        fireEvent.change(screen.getByPlaceholderText('//element[@attr]'), { target: { value: '//item' } });
        act(() => {
            fireEvent.click(screen.getByRole('button', { name: 'Run Query' }));
        });
        expect(container.querySelector('.pill.muted')).toBeInTheDocument();
    });
});
