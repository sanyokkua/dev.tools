import { fireEvent, render, screen } from '@testing-library/react';
import type { PromptsData, SkillsData } from '../../../../src/common/prompts/types';
import CommandPalette from '../../../../src/components/page-specific/prompts-collection/CommandPalette';

const mockPromptsData: PromptsData = {
    domains: [{ code: 'A', title: 'Engineering', description: '', slug: 'engineering' }],
    categories: [{ code: 'A01', domainCode: 'A', slug: 'code-review', title: 'Code Review' }],
    logical: [
        {
            id: 'lp-1',
            categoryCode: 'A01',
            title: 'Code Review',
            description: 'Review code',
            variantAxes: [],
            variantIds: ['v-1'],
            defaultVariantId: 'v-1',
        },
    ],
    variants: [
        {
            id: 'v-1',
            kind: 'user',
            categoryCode: 'A01',
            title: 'Code Review',
            description: 'Review code changes',
            template: '{{code}}',
            parameters: [],
            keywords: ['review'],
        },
    ],
};

const mockSkillsData: SkillsData = {
    skills: [
        {
            id: 'sk-1',
            slug: 'tdd',
            domainCode: 'A',
            title: 'Test-Driven Development',
            version: '1.0',
            description: 'TDD workflow',
            tags: ['testing'],
            allowedTools: [],
            relatedSkillIds: [],
            files: [],
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
            <CommandPalette
                isOpen={false}
                onClose={onClose}
                onSelect={onSelect}
                promptsData={mockPromptsData}
                skillsData={mockSkillsData}
            />,
        );
        expect(container.querySelector('[data-testid="cmd-palette"]')).toBeNull();
    });

    it('renders palette and input when isOpen is true', () => {
        render(
            <CommandPalette
                isOpen={true}
                onClose={onClose}
                onSelect={onSelect}
                promptsData={mockPromptsData}
                skillsData={mockSkillsData}
            />,
        );
        expect(screen.getByTestId('cmd-palette')).toBeInTheDocument();
        expect(screen.getByTestId('cmd-palette-input')).toBeInTheDocument();
    });

    it('shows results list after typing', () => {
        render(
            <CommandPalette
                isOpen={true}
                onClose={onClose}
                onSelect={onSelect}
                promptsData={mockPromptsData}
                skillsData={mockSkillsData}
            />,
        );
        fireEvent.change(screen.getByTestId('cmd-palette-input'), { target: { value: 'code' } });
        expect(screen.getByTestId('cmd-palette-results')).toBeInTheDocument();
        expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    });

    it('shows no-results message for unmatched query', () => {
        render(
            <CommandPalette
                isOpen={true}
                onClose={onClose}
                onSelect={onSelect}
                promptsData={mockPromptsData}
                skillsData={mockSkillsData}
            />,
        );
        fireEvent.change(screen.getByTestId('cmd-palette-input'), { target: { value: 'zzzunmatchable' } });
        expect(screen.getByTestId('cmd-palette-empty')).toBeInTheDocument();
    });

    it('calls onClose when Escape is pressed', () => {
        render(
            <CommandPalette
                isOpen={true}
                onClose={onClose}
                onSelect={onSelect}
                promptsData={mockPromptsData}
                skillsData={mockSkillsData}
            />,
        );
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', () => {
        render(
            <CommandPalette
                isOpen={true}
                onClose={onClose}
                onSelect={onSelect}
                promptsData={mockPromptsData}
                skillsData={mockSkillsData}
            />,
        );
        fireEvent.click(screen.getByTestId('cmd-palette-backdrop'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSelect when a result is clicked', () => {
        render(
            <CommandPalette
                isOpen={true}
                onClose={onClose}
                onSelect={onSelect}
                promptsData={mockPromptsData}
                skillsData={mockSkillsData}
            />,
        );
        fireEvent.change(screen.getByTestId('cmd-palette-input'), { target: { value: 'code' } });
        fireEvent.click(screen.getAllByRole('option')[0]);
        expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('unmounts cleanly when isOpen changes to false', () => {
        const { rerender } = render(
            <CommandPalette
                isOpen={true}
                onClose={onClose}
                onSelect={onSelect}
                promptsData={mockPromptsData}
                skillsData={mockSkillsData}
            />,
        );
        rerender(
            <CommandPalette
                isOpen={false}
                onClose={onClose}
                onSelect={onSelect}
                promptsData={mockPromptsData}
                skillsData={mockSkillsData}
            />,
        );
        expect(screen.queryByTestId('cmd-palette')).toBeNull();
    });

    it('ArrowDown selects first result; ArrowUp goes back', () => {
        render(
            <CommandPalette
                isOpen={true}
                onClose={onClose}
                onSelect={onSelect}
                promptsData={mockPromptsData}
                skillsData={mockSkillsData}
            />,
        );
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
        render(
            <CommandPalette
                isOpen={true}
                onClose={onClose}
                onSelect={onSelect}
                promptsData={mockPromptsData}
                skillsData={mockSkillsData}
            />,
        );
        const input = screen.getByTestId('cmd-palette-input');
        fireEvent.change(input, { target: { value: 'code' } });
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('handles null promptsData without crashing', () => {
        expect(() =>
            render(
                <CommandPalette
                    isOpen={true}
                    onClose={onClose}
                    onSelect={onSelect}
                    promptsData={null}
                    skillsData={mockSkillsData}
                />,
            ),
        ).not.toThrow();
    });
});
