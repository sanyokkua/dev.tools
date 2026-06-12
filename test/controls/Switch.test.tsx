import { fireEvent, render, screen } from '@testing-library/react';
import Switch from '../../src/components/controls/Switch';

describe('Switch', () => {
    it('renders unchecked with aria-checked=false', () => {
        render(<Switch checked={false} onChange={jest.fn()} label="Dark mode" />);
        expect(screen.getByRole('switch', { name: 'Dark mode' })).toHaveAttribute('aria-checked', 'false');
    });

    it('renders checked with aria-checked=true', () => {
        render(<Switch checked={true} onChange={jest.fn()} label="Dark mode" />);
        expect(screen.getByRole('switch', { name: 'Dark mode' })).toHaveAttribute('aria-checked', 'true');
    });

    it('calls onChange(true) when toggled on', () => {
        const onChange = jest.fn();
        render(<Switch checked={false} onChange={onChange} label="Toggle" />);
        fireEvent.click(screen.getByRole('switch'));
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('calls onChange(false) when toggled off', () => {
        const onChange = jest.fn();
        render(<Switch checked={true} onChange={onChange} label="Toggle" />);
        fireEvent.click(screen.getByRole('switch'));
        expect(onChange).toHaveBeenCalledWith(false);
    });

    it('does not call onChange when disabled', () => {
        const onChange = jest.fn();
        render(<Switch checked={false} onChange={onChange} label="Toggle" disabled />);
        fireEvent.click(screen.getByRole('switch'));
        expect(onChange).not.toHaveBeenCalled();
    });
});
