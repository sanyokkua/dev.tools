import { render, screen } from '@testing-library/react';
import EditorToolbar from '../../../../src/components/elements/editor/EditorToolbar';

describe('EditorToolbar', () => {
    it('renders a div with class "eh" and role="toolbar"', () => {
        render(<EditorToolbar />);
        const toolbar = screen.getByRole('toolbar');
        expect(toolbar).toBeInTheDocument();
        expect(toolbar.classList.contains('eh')).toBe(true);
    });

    it('renders children correctly', () => {
        render(
            <EditorToolbar>
                <button>Save</button>
            </EditorToolbar>,
        );
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('renders multiple children', () => {
        render(
            <EditorToolbar>
                <button>Open</button>
                <button>Save</button>
                <button>Clear</button>
            </EditorToolbar>,
        );
        expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    });

    it('renders with no children without crashing', () => {
        render(<EditorToolbar />);
        expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });
});
