import { fireEvent, render, screen } from '@testing-library/react';
import type { Manifest } from '../../../../src/common/prompts/model/types';
import CommandPalette from '../../../../src/components/page-specific/prompts-collection/CommandPalette';

const mockManifest: Manifest = {
    domains: [{ code: 'A', title: 'Engineering', description: '', slug: 'engineering' }],
    categories: [{ code: 'A01', domainCode: 'A', slug: 'code-review', title: 'Code Review' }],
    logical: [
        {
            id: 'lp-1',
            categoryCode: 'A01',
            domainCode: 'A',
            title: 'Code Review',
            description: 'Review code',
            keywords: ['review'],
            tags: [],
            variantAxes: [],
            hasChat: true,
            hasAgent: false,
            hasModel: false,
            modelCount: 0,
            isMetaPrompt: false,
        },
    ],
    skills: [
        {
            id: 'SKILL-tdd',
            slug: 'tdd',
            domainCode: 'A',
            title: 'Test-Driven Development',
            version: '1.0',
            description: 'TDD workflow',
            tags: ['testing'],
            fileCount: 0,
        },
    ],
};

describe('CommandPalette', () => {
    const onClose = jest.fn();
    const onSelect = jest.fn();

    beforeEach(() => {
        onClose.mockClear();
        onSelect.mockClear();
    });

    it('renders nothing when isOpen is false', () => {
        const { container } = render(
            <CommandPalette isOpen={false} onClose={onClose} onSelect={onSelect} manifest={mockManifest} />,
        );
        expect(container.querySelector('[data-testid="cmd-palette"]')).toBeNull();
    });

    it('renders palette and input when isOpen is true', () => {
        render(<CommandPalette isOpen={true} onClose={onClose} onSelect={onSelect} manifest={mockManifest} />);
        expect(screen.getByTestId('cmd-palette')).toBeInTheDocument();
        expect(screen.getByTestId('cmd-palette-input')).toBeInTheDocument();
    });

    it('shows results list after typing', () => {
        render(<CommandPalette isOpen={true} onClose={onClose} onSelect={onSelect} manifest={mockManifest} />);
        fireEvent.change(screen.getByTestId('cmd-palette-input'), { target: { value: 'code' } });
        expect(screen.getByTestId('cmd-palette-results')).toBeInTheDocument();
        expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    });

    it('shows no-results message for unmatched query', () => {
        render(<CommandPalette isOpen={true} onClose={onClose} onSelect={onSelect} manifest={mockManifest} />);
        fireEvent.change(screen.getByTestId('cmd-palette-input'), { target: { value: 'zzzunmatchable' } });
        expect(screen.getByTestId('cmd-palette-empty')).toBeInTheDocument();
    });

    it('calls onClose when Escape is pressed', () => {
        render(<CommandPalette isOpen={true} onClose={onClose} onSelect={onSelect} manifest={mockManifest} />);
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', () => {
        render(<CommandPalette isOpen={true} onClose={onClose} onSelect={onSelect} manifest={mockManifest} />);
        fireEvent.click(screen.getByTestId('cmd-palette-backdrop'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSelect when a result is clicked', () => {
        render(<CommandPalette isOpen={true} onClose={onClose} onSelect={onSelect} manifest={mockManifest} />);
        fireEvent.change(screen.getByTestId('cmd-palette-input'), { target: { value: 'code' } });
        fireEvent.click(screen.getAllByRole('option')[0]);
        expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('unmounts cleanly when isOpen changes to false', () => {
        const { rerender } = render(
            <CommandPalette isOpen={true} onClose={onClose} onSelect={onSelect} manifest={mockManifest} />,
        );
        rerender(<CommandPalette isOpen={false} onClose={onClose} onSelect={onSelect} manifest={mockManifest} />);
        expect(screen.queryByTestId('cmd-palette')).toBeNull();
    });

    it('ArrowDown selects first result; ArrowUp goes back', () => {
        render(<CommandPalette isOpen={true} onClose={onClose} onSelect={onSelect} manifest={mockManifest} />);
        const input = screen.getByTestId('cmd-palette-input');
        fireEvent.change(input, { target: { value: 'code' } });
        const options = screen.getAllByRole('option');

        fireEvent.keyDown(input, { key: 'ArrowDown' });
        expect(options[0]).toHaveAttribute('aria-selected', 'true');

        if (options.length > 1) {
            fireEvent.keyDown(input, { key: 'ArrowDown' });
            expect(options[1]).toHaveAttribute('aria-selected', 'true');
            fireEvent.keyDown(input, { key: 'ArrowUp' });
            expect(options[0]).toHaveAttribute('aria-selected', 'true');
        }
    });

    it('Enter on highlighted result calls onSelect', () => {
        render(<CommandPalette isOpen={true} onClose={onClose} onSelect={onSelect} manifest={mockManifest} />);
        const input = screen.getByTestId('cmd-palette-input');
        fireEvent.change(input, { target: { value: 'code' } });
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onSelect).toHaveBeenCalledTimes(1);
    });
});
