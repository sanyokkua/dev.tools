import { render, screen } from '@testing-library/react';
import { PromptCategory, PromptType } from '../../../src/common/prompts/prompts';
import { ToasterProvider } from '../../../src/components/contexts/ToasterContext';
import PromptDetailPanel from '../../../src/components/page-specific/prompts-collection/PromptDetailPanel';

const mockPrompt = {
    id: 'test-prompt',
    type: PromptType.USER_PROMPT_PARAMETRIZED,
    category: PromptCategory.CODE_GENERATION,
    tags: ['test', 'code'],
    description: 'A test prompt for unit tests',
    template: 'Write {{language}} code for {{task}}',
    parameters: ['language', 'task'],
};

const renderPanel = () =>
    render(
        <ToasterProvider>
            <PromptDetailPanel prompt={mockPrompt} />
        </ToasterProvider>,
    );

describe('PromptDetailPanel', () => {
    it('renders prompt description', () => {
        renderPanel();
        expect(screen.getByText('A test prompt for unit tests')).toBeInTheDocument();
    });

    it('renders a .steplabel step circle for parameters', () => {
        const { container } = renderPanel();
        expect(container.querySelector('.steplabel')).toBeInTheDocument();
        expect(container.querySelector('.steplabel .n')).toBeInTheDocument();
    });

    it('does not render bespoke .prompt-step-label', () => {
        const { container } = renderPanel();
        expect(container.querySelector('.prompt-step-label')).toBeNull();
    });

    it('renders AutoTextarea elements (not .text-editor) for parameters', () => {
        const { container } = renderPanel();
        expect(container.querySelectorAll('.textarea-auto').length).toBeGreaterThan(0);
        expect(container.querySelector('.text-editor')).toBeNull();
    });

    it('Reset button has .ghost class', () => {
        renderPanel();
        const resetBtn = screen.getByRole('button', { name: /reset/i });
        expect(resetBtn).toHaveClass('ghost');
    });

    it('Copy raw button has .outline class', () => {
        renderPanel();
        const copyRawBtn = screen.getByRole('button', { name: /copy raw/i });
        expect(copyRawBtn).toHaveClass('outline');
    });

    it('Copy edited button has .tonal class', () => {
        renderPanel();
        const copyEditedBtn = screen.getByRole('button', { name: /copy edited/i });
        expect(copyEditedBtn).toHaveClass('tonal');
    });

    it('renders .field wrappers for parameter inputs', () => {
        const { container } = renderPanel();
        const fields = container.querySelectorAll('.field');
        expect(fields.length).toBe(2); // language + task
    });
});
