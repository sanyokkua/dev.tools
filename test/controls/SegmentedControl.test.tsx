import { fireEvent, render, screen } from '@testing-library/react';
import SegmentedControl from '../../src/components/controls/SegmentedControl';

const options = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
    { value: 'c', label: 'Gamma' },
];

describe('SegmentedControl', () => {
    it('renders all option labels', () => {
        render(<SegmentedControl options={options} value="a" onChange={jest.fn()} />);
        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.getByText('Beta')).toBeInTheDocument();
        expect(screen.getByText('Gamma')).toBeInTheDocument();
    });

    it('sets aria-pressed=true only on the active option', () => {
        render(<SegmentedControl options={options} value="b" onChange={jest.fn()} />);
        expect(screen.getByText('Alpha').closest('button')).toHaveAttribute('aria-pressed', 'false');
        expect(screen.getByText('Beta').closest('button')).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByText('Gamma').closest('button')).toHaveAttribute('aria-pressed', 'false');
    });

    it('calls onChange with the clicked value', () => {
        const onChange = jest.fn();
        render(<SegmentedControl options={options} value="a" onChange={onChange} />);
        fireEvent.click(screen.getByText('Gamma'));
        expect(onChange).toHaveBeenCalledWith('c');
    });

    it('does not call onChange when clicking the already-active option', () => {
        const onChange = jest.fn();
        render(<SegmentedControl options={options} value="a" onChange={onChange} />);
        fireEvent.click(screen.getByText('Alpha'));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('renders with aria-label on the group when provided', () => {
        render(<SegmentedControl options={options} value="a" onChange={jest.fn()} aria-label="Mode" />);
        expect(screen.getByRole('group', { name: 'Mode' })).toBeInTheDocument();
    });
});
