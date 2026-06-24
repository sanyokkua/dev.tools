import { ThemeProvider } from '@/contexts/ThemeContext';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import SplitPreviewEditor from '../../../../src/components/elements/editor/SplitPreviewEditor';

let fireMonacoChange: ((v: string | undefined) => void) | undefined;

jest.mock('@monaco-editor/react', () => ({
    Editor: (props: {
        theme?: string;
        value?: string;
        onChange?: (v: string | undefined) => void;
        language?: string;
    }) => {
        fireMonacoChange = props.onChange;
        return (
            <div
                data-testid="monaco"
                data-theme={props.theme}
                data-value={props.value ?? ''}
                data-language={props.language}
            />
        );
    },
}));

function wrap(ui: React.ReactElement) {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('SplitPreviewEditor', () => {
    beforeEach(() => {
        fireMonacoChange = undefined;
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
        globalThis.matchMedia = jest
            .fn()
            .mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() });
    });

    it('renders the Monaco editor and the preview pane', () => {
        wrap(<SplitPreviewEditor renderPreview={() => <div data-testid="preview">Preview</div>} />);
        expect(screen.getByTestId('monaco')).toBeInTheDocument();
        expect(screen.getByTestId('preview')).toBeInTheDocument();
    });

    it('renders editorToolbarChildren inside the editor toolbar', () => {
        wrap(<SplitPreviewEditor renderPreview={() => null} editorToolbarChildren={<button>Open</button>} />);
        expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
    });

    it('renders previewToolbarChildren inside the preview toolbar', () => {
        wrap(<SplitPreviewEditor renderPreview={() => null} previewToolbarChildren={<button>Export</button>} />);
        expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });

    it('passes value to the Monaco editor', () => {
        wrap(<SplitPreviewEditor value="hello world" renderPreview={() => null} />);
        expect(screen.getByTestId('monaco')).toHaveAttribute('data-value', 'hello world');
    });

    it('calls renderPreview with the current value', () => {
        const renderPreview = jest.fn().mockReturnValue(<div />);
        wrap(<SplitPreviewEditor value="test content" renderPreview={renderPreview} />);
        expect(renderPreview).toHaveBeenCalledWith('test content');
    });

    it('passes the language prop to the Monaco editor', () => {
        wrap(<SplitPreviewEditor language="markdown" renderPreview={() => null} />);
        expect(screen.getByTestId('monaco')).toHaveAttribute('data-language', 'markdown');
    });

    it('calls onChange with the string value when Monaco fires change', () => {
        const onChange = jest.fn();
        wrap(<SplitPreviewEditor value="" onChange={onChange} renderPreview={() => null} />);
        act(() => {
            fireMonacoChange?.('new content');
        });
        expect(onChange).toHaveBeenCalledWith('new content');
    });

    it('calls onChange with empty string when Monaco fires undefined', () => {
        const onChange = jest.fn();
        wrap(<SplitPreviewEditor value="" onChange={onChange} renderPreview={() => null} />);
        act(() => {
            fireMonacoChange?.(undefined);
        });
        expect(onChange).toHaveBeenCalledWith('');
    });

    it('edge: calls renderPreview with empty string when value is empty', () => {
        const renderPreview = jest.fn().mockReturnValue(<div data-testid="empty-preview" />);
        wrap(<SplitPreviewEditor value="" renderPreview={renderPreview} />);
        expect(renderPreview).toHaveBeenCalledWith('');
        expect(screen.getByTestId('empty-preview')).toBeInTheDocument();
    });

    it('edge: does not throw when onChange is not provided and Monaco fires change', () => {
        wrap(<SplitPreviewEditor value="x" renderPreview={() => null} />);
        expect(() =>
            act(() => {
                fireMonacoChange?.('y');
            }),
        ).not.toThrow();
    });

    it('edge: renders both toolbars even when toolbar children are not provided', () => {
        const { container } = wrap(<SplitPreviewEditor renderPreview={() => <span>ok</span>} />);
        const toolbars = container.querySelectorAll('[role="toolbar"]');
        expect(toolbars).toHaveLength(2);
    });

    it('syncs Monaco theme to app theme — defaults to "vs" (light)', () => {
        wrap(<SplitPreviewEditor renderPreview={() => null} />);
        expect(screen.getByTestId('monaco')).toHaveAttribute('data-theme', 'vs');
    });
});
