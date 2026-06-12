import { fireEvent, render, screen } from '@testing-library/react';
import Checkbox from '../../src/components/controls/Checkbox';

describe('Checkbox', () => {
    it('renders unchecked with aria-checked=false', () => {
        render(<Checkbox checked={false} onChange={jest.fn()} label="Accept" />);
        expect(screen.getByRole('checkbox', { name: 'Accept' })).toHaveAttribute('aria-checked', 'false');
    });

    it('renders checked with aria-checked=true', () => {
        render(<Checkbox checked={true} onChange={jest.fn()} label="Accept" />);
        expect(screen.getByRole('checkbox', { name: 'Accept' })).toHaveAttribute('aria-checked', 'true');
    });

    it('calls onChange(true) when unchecked and clicked', () => {
        const onChange = jest.fn();
        render(<Checkbox checked={false} onChange={onChange} label="Accept" />);
        fireEvent.click(screen.getByRole('checkbox'));
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('calls onChange(false) when checked and clicked', () => {
        const onChange = jest.fn();
        render(<Checkbox checked={true} onChange={onChange} label="Accept" />);
        fireEvent.click(screen.getByRole('checkbox'));
        expect(onChange).toHaveBeenCalledWith(false);
    });

    it('does not call onChange when disabled', () => {
        const onChange = jest.fn();
        render(<Checkbox checked={false} onChange={onChange} label="Accept" disabled />);
        fireEvent.click(screen.getByRole('checkbox'));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('renders label text', () => {
        render(<Checkbox checked={false} onChange={jest.fn()} label="My label" />);
        expect(screen.getByText('My label')).toBeInTheDocument();
    });
});
