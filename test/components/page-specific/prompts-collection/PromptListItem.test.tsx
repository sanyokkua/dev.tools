import { fireEvent, render, screen } from '@testing-library/react';
import type { ManifestLogical } from '../../../../src/common/prompts/model/types';
import PromptListItem from '../../../../src/components/page-specific/prompts-collection/PromptListItem';

const base: ManifestLogical = {
    id: 'LP-A01-test',
    categoryCode: 'A01',
    domainCode: 'A',
    title: 'Test Prompt',
    description: '',
    tags: [],
    variantAxes: [],
    hasChat: true,
    hasAgent: false,
    hasModel: false,
    modelCount: 0,
    isMetaPrompt: false,
    keywords: [],
};

describe('PromptListItem — rendering', () => {
    const onClick = jest.fn();

    beforeEach(() => {
        onClick.mockClear();
    });

    it('renders the prompt title', () => {
        render(<PromptListItem logical={base} selected={false} onClick={onClick} />);
        expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    });

    it('has role=option', () => {
        const { container } = render(<PromptListItem logical={base} selected={false} onClick={onClick} />);
        const item = container.querySelector('[role="option"]');
        expect(item).toBeInTheDocument();
    });

    it('aria-selected=false when not selected', () => {
        const { container } = render(<PromptListItem logical={base} selected={false} onClick={onClick} />);
        const item = container.querySelector('[role="option"]');
        expect(item).toHaveAttribute('aria-selected', 'false');
    });

    it('aria-selected=true when selected', () => {
        const { container } = render(<PromptListItem logical={base} selected={true} onClick={onClick} />);
        const item = container.querySelector('[role="option"]');
        expect(item).toHaveAttribute('aria-selected', 'true');
    });

    it('is keyboard-focusable (tabIndex=0)', () => {
        const { container } = render(<PromptListItem logical={base} selected={false} onClick={onClick} />);
        const item = container.querySelector('[role="option"]');
        expect(item).toHaveAttribute('tabIndex', '0');
    });

    it('shows Chat tag when hasChat=true, hasAgent=false', () => {
        const logical = { ...base, hasChat: true, hasAgent: false };
        render(<PromptListItem logical={logical} selected={false} onClick={onClick} />);
        expect(screen.getByText('Chat')).toBeInTheDocument();
    });

    it('shows Agent tag when hasAgent=true, hasChat=false', () => {
        const logical = { ...base, hasChat: false, hasAgent: true };
        render(<PromptListItem logical={logical} selected={false} onClick={onClick} />);
        expect(screen.getByText('Agent')).toBeInTheDocument();
    });

    it('shows Dual tag when both hasChat and hasAgent are true', () => {
        const logical = { ...base, hasChat: true, hasAgent: true };
        render(<PromptListItem logical={logical} selected={false} onClick={onClick} />);
        expect(screen.getByText('Dual')).toBeInTheDocument();
    });

    it('shows model count tag when modelCount > 0', () => {
        const logical = { ...base, modelCount: 3 };
        render(<PromptListItem logical={logical} selected={false} onClick={onClick} />);
        expect(screen.getByText(/🎨 3 models/)).toBeInTheDocument();
    });

    it('shows singular model label when modelCount=1', () => {
        const logical = { ...base, modelCount: 1 };
        render(<PromptListItem logical={logical} selected={false} onClick={onClick} />);
        expect(screen.getByText(/🎨 1 model/)).toBeInTheDocument();
    });

    it('shows meta tag when isMetaPrompt=true', () => {
        const logical = { ...base, isMetaPrompt: true };
        render(<PromptListItem logical={logical} selected={false} onClick={onClick} />);
        expect(screen.getByText('⚗ meta')).toBeInTheDocument();
    });

    it('shows no mode tag when both hasChat and hasAgent are false', () => {
        const logical = { ...base, hasChat: false, hasAgent: false };
        render(<PromptListItem logical={logical} selected={false} onClick={onClick} />);
        expect(screen.queryByText('Chat')).not.toBeInTheDocument();
        expect(screen.queryByText('Agent')).not.toBeInTheDocument();
        expect(screen.queryByText('Dual')).not.toBeInTheDocument();
    });
});

describe('PromptListItem — keyboard navigation', () => {
    const onClick = jest.fn();

    beforeEach(() => {
        onClick.mockClear();
    });

    it('fires onClick on mouse click', () => {
        const { container } = render(<PromptListItem logical={base} selected={false} onClick={onClick} />);
        const item = container.querySelector('[role="option"]') as HTMLElement;
        fireEvent.click(item);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('fires onClick on Enter key', () => {
        const { container } = render(<PromptListItem logical={base} selected={false} onClick={onClick} />);
        const item = container.querySelector('[role="option"]') as HTMLElement;
        fireEvent.keyDown(item, { key: 'Enter' });
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('fires onClick on Space key', () => {
        const { container } = render(<PromptListItem logical={base} selected={false} onClick={onClick} />);
        const item = container.querySelector('[role="option"]') as HTMLElement;
        fireEvent.keyDown(item, { key: ' ' });
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does NOT fire onClick on other keys (e.g. Tab)', () => {
        const { container } = render(<PromptListItem logical={base} selected={false} onClick={onClick} />);
        const item = container.querySelector('[role="option"]') as HTMLElement;
        fireEvent.keyDown(item, { key: 'Tab' });
        expect(onClick).not.toHaveBeenCalled();
    });
});
