import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToasterProvider } from '@/contexts/ToasterContext';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import DiffPage from '../../../src/pages/diff/DiffPage';

// ── Monaco DiffEditor mock ─────────────────────────────────────────────────────
type MockDiffEditorProps = {
    language?: string;
    theme?: string;
    options?: Record<string, unknown>;
    onMount?: (editor: MockDiffEditorInstance) => void;
};

interface MockDiffEditorInstance {
    getOriginalEditor(): MockSideEditor;
    getModifiedEditor(): MockSideEditor;
}

interface MockSideEditor {
    getValue(): string;
    setValue(v: string): void;
    onDidChangeModelContent(cb: () => void): void;
}

function makeSideEditor(initial = ''): MockSideEditor & { _fireChange: () => void } {
    let value = initial;
    let changeListener: (() => void) | null = null;
    return {
        getValue: () => value,
        setValue: (v: string) => {
            value = v;
            changeListener?.();
        },
        onDidChangeModelContent: (cb: () => void) => {
            changeListener = cb;
        },
        _fireChange: () => changeListener?.(),
    };
}

let mockOrigEditor: ReturnType<typeof makeSideEditor>;
let mockModEditor: ReturnType<typeof makeSideEditor>;
let capturedOnMount: MockDiffEditorProps['onMount'];

jest.mock('@monaco-editor/react', () => ({
    DiffEditor: (props: MockDiffEditorProps) => {
        capturedOnMount = props.onMount;
        return (
            <div
                data-testid="diff-editor"
                data-language={props.language}
                data-theme={props.theme}
                data-ignore-whitespace={String(props.options?.ignoreTrimWhitespace ?? false)}
            />
        );
    },
}));

function wrap(ui: React.ReactElement) {
    return render(
        <ThemeProvider>
            <ToasterProvider>{ui}</ToasterProvider>
        </ThemeProvider>,
    );
}

function mountDiffEditor() {
    mockOrigEditor = makeSideEditor();
    mockModEditor = makeSideEditor();
    act(() => {
        capturedOnMount?.({ getOriginalEditor: () => mockOrigEditor, getModifiedEditor: () => mockModEditor });
    });
}

beforeEach(() => {
    capturedOnMount = undefined;
    window.matchMedia = jest
        .fn()
        .mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() });
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: jest.fn().mockResolvedValue(undefined) },
        writable: true,
        configurable: true,
    });
    jest.useFakeTimers();
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

describe('DiffPage – renders', () => {
    it('renders the Monaco DiffEditor', () => {
        wrap(<DiffPage />);
        expect(screen.getByTestId('diff-editor')).toBeInTheDocument();
    });

    it('renders type selector with Text / JSON / XML options', () => {
        wrap(<DiffPage />);
        expect(screen.getByRole('button', { name: 'Text' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'JSON' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'XML' })).toBeInTheDocument();
    });

    it('renders Swap and Copy Modified buttons', () => {
        wrap(<DiffPage />);
        expect(screen.getByRole('button', { name: /swap/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /copy modified/i })).toBeInTheDocument();
    });

    it('renders Ignore whitespace switch', () => {
        wrap(<DiffPage />);
        expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('passes "plaintext" language for Text type (default)', () => {
        wrap(<DiffPage />);
        expect(screen.getByTestId('diff-editor')).toHaveAttribute('data-language', 'plaintext');
    });

    it('defaults ignore-whitespace to false', () => {
        wrap(<DiffPage />);
        expect(screen.getByTestId('diff-editor')).toHaveAttribute('data-ignore-whitespace', 'false');
    });
});

describe('DiffPage – type selector', () => {
    it('switching to JSON passes "json" language to DiffEditor', () => {
        wrap(<DiffPage />);
        fireEvent.click(screen.getByRole('button', { name: 'JSON' }));
        expect(screen.getByTestId('diff-editor')).toHaveAttribute('data-language', 'json');
    });

    it('switching to XML passes "xml" language to DiffEditor', () => {
        wrap(<DiffPage />);
        fireEvent.click(screen.getByRole('button', { name: 'XML' }));
        expect(screen.getByTestId('diff-editor')).toHaveAttribute('data-language', 'xml');
    });
});

describe('DiffPage – ignore whitespace', () => {
    it('toggling the switch changes the data-ignore-whitespace attribute', () => {
        wrap(<DiffPage />);
        const sw = screen.getByRole('switch');
        fireEvent.click(sw);
        expect(screen.getByTestId('diff-editor')).toHaveAttribute('data-ignore-whitespace', 'true');
        fireEvent.click(sw);
        expect(screen.getByTestId('diff-editor')).toHaveAttribute('data-ignore-whitespace', 'false');
    });
});

describe('DiffPage – Swap', () => {
    it('swaps original and modified editor content', () => {
        wrap(<DiffPage />);
        mountDiffEditor();

        act(() => {
            mockOrigEditor.setValue('left');
        });
        act(() => {
            mockModEditor.setValue('right');
        });

        fireEvent.click(screen.getByRole('button', { name: /swap/i }));

        expect(mockOrigEditor.getValue()).toBe('right');
        expect(mockModEditor.getValue()).toBe('left');
    });
});

describe('DiffPage – Copy Modified', () => {
    it('copies modified editor content to clipboard', () => {
        wrap(<DiffPage />);
        mountDiffEditor();

        act(() => {
            mockModEditor.setValue('copy me');
        });
        act(() => {
            mockModEditor._fireChange();
        });

        fireEvent.click(screen.getByRole('button', { name: /copy modified/i }));

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('copy me');
    });
});

describe('DiffPage – normalization debounce', () => {
    it('does not normalize in text mode', () => {
        wrap(<DiffPage />);
        mountDiffEditor();
        act(() => {
            mockOrigEditor.setValue('{"b":1,"a":2}');
            mockOrigEditor._fireChange();
        });
        act(() => {
            jest.advanceTimersByTime(400);
        });
        expect(mockOrigEditor.getValue()).toBe('{"b":1,"a":2}');
    });

    it('normalizes valid JSON after debounce when type=JSON', () => {
        wrap(<DiffPage />);
        mountDiffEditor();
        fireEvent.click(screen.getByRole('button', { name: 'JSON' }));

        act(() => {
            mockOrigEditor.setValue('{"b":1,"a":2}');
            mockOrigEditor._fireChange();
        });
        act(() => {
            jest.advanceTimersByTime(400);
        });

        expect(mockOrigEditor.getValue()).toBe('{\n  "a": 2,\n  "b": 1\n}');
    });

    it('leaves invalid JSON in place (does not clear editor content)', () => {
        wrap(<DiffPage />);
        mountDiffEditor();
        fireEvent.click(screen.getByRole('button', { name: 'JSON' }));

        const badJson = '{invalid}';
        act(() => {
            mockOrigEditor.setValue(badJson);
            mockOrigEditor._fireChange();
        });
        act(() => {
            jest.advanceTimersByTime(400);
        });

        expect(mockOrigEditor.getValue()).toBe(badJson);
    });
});
