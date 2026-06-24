import { fireEvent, render, screen } from '@testing-library/react';
import type { ManifestSkill } from '../../../../src/common/prompts/model/types';
import SkillListItem from '../../../../src/components/page-specific/prompts-collection/SkillListItem';

const base: ManifestSkill = {
    id: 'SKL-A01-code-review',
    slug: 'code-review',
    domainCode: 'A',
    title: 'Code Review',
    version: '1.0.0',
    description: '',
    tags: [],
    fileCount: 3,
};

describe('SkillListItem — rendering', () => {
    const onClick = jest.fn();

    beforeEach(() => {
        onClick.mockClear();
    });

    it('renders the skill title', () => {
        render(<SkillListItem skill={base} selected={false} onClick={onClick} />);
        expect(screen.getByText('Code Review')).toBeInTheDocument();
    });

    it('has role=option', () => {
        const { container } = render(<SkillListItem skill={base} selected={false} onClick={onClick} />);
        const item = container.querySelector('[role="option"]');
        expect(item).toBeInTheDocument();
    });

    it('aria-selected=false when not selected', () => {
        const { container } = render(<SkillListItem skill={base} selected={false} onClick={onClick} />);
        const item = container.querySelector('[role="option"]');
        expect(item).toHaveAttribute('aria-selected', 'false');
    });

    it('aria-selected=true when selected', () => {
        const { container } = render(<SkillListItem skill={base} selected={true} onClick={onClick} />);
        const item = container.querySelector('[role="option"]');
        expect(item).toHaveAttribute('aria-selected', 'true');
    });

    it('is keyboard-focusable (tabIndex=0)', () => {
        const { container } = render(<SkillListItem skill={base} selected={false} onClick={onClick} />);
        const item = container.querySelector('[role="option"]');
        expect(item).toHaveAttribute('tabIndex', '0');
    });

    it('shows skill emoji tag (🧩 skill)', () => {
        render(<SkillListItem skill={base} selected={false} onClick={onClick} />);
        expect(screen.getByText('🧩 skill')).toBeInTheDocument();
    });

    it('shows the version', () => {
        render(<SkillListItem skill={base} selected={false} onClick={onClick} />);
        expect(screen.getByText('1.0.0')).toBeInTheDocument();
    });
});

describe('SkillListItem — keyboard navigation', () => {
    const onClick = jest.fn();

    beforeEach(() => {
        onClick.mockClear();
    });

    it('fires onClick on mouse click', () => {
        const { container } = render(<SkillListItem skill={base} selected={false} onClick={onClick} />);
        const item = container.querySelector('[role="option"]') as HTMLElement;
        fireEvent.click(item);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('fires onClick on Enter key', () => {
        const { container } = render(<SkillListItem skill={base} selected={false} onClick={onClick} />);
        const item = container.querySelector('[role="option"]') as HTMLElement;
        fireEvent.keyDown(item, { key: 'Enter' });
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('fires onClick on Space key', () => {
        const { container } = render(<SkillListItem skill={base} selected={false} onClick={onClick} />);
        const item = container.querySelector('[role="option"]') as HTMLElement;
        fireEvent.keyDown(item, { key: ' ' });
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does NOT fire onClick on other keys (e.g. Tab)', () => {
        const { container } = render(<SkillListItem skill={base} selected={false} onClick={onClick} />);
        const item = container.querySelector('[role="option"]') as HTMLElement;
        fireEvent.keyDown(item, { key: 'Tab' });
        expect(onClick).not.toHaveBeenCalled();
    });
});
