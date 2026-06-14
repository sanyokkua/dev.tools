import CodeEditorInfoLine from '@/elements/editor/CodeEditorInfoLine';
import { render, screen } from '@testing-library/react';

const baseProps = {
    cursorLine: 3,
    cursorColumn: 12,
    languageDisplayName: 'TypeScript',
    eol: 'LF',
    tabSize: 4,
    insertSpaces: true,
    charCount: 200,
};

describe('CodeEditorInfoLine', () => {
    it('does not render UTF-8', () => {
        render(<CodeEditorInfoLine {...baseProps} />);
        expect(screen.queryByText('UTF-8')).toBeNull();
    });

    it('shows "Spaces: N" when insertSpaces is true', () => {
        render(<CodeEditorInfoLine {...baseProps} insertSpaces={true} tabSize={4} />);
        expect(screen.getByText(/Spaces: 4/)).toBeInTheDocument();
    });

    it('shows "Tab Size: N" when insertSpaces is false', () => {
        render(<CodeEditorInfoLine {...baseProps} insertSpaces={false} tabSize={2} />);
        expect(screen.getByText(/Tab Size: 2/)).toBeInTheDocument();
    });

    it('renders cursor position and language', () => {
        render(<CodeEditorInfoLine {...baseProps} />);
        expect(screen.getByText('Ln 3, Col 12')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('LF')).toBeInTheDocument();
    });
});
