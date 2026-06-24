import { fireEvent, render, screen } from '@testing-library/react';
import AutoTextarea from '../../src/components/controls/AutoTextarea';

describe('AutoTextarea', () => {
    it('renders a textarea with .textarea-auto class', () => {
        render(<AutoTextarea value="" onChange={jest.fn()} />);
        const ta = screen.getByRole('textbox');
        expect(ta.tagName).toBe('TEXTAREA');
        expect(ta).toHaveClass('textarea-auto');
    });

    it('displays value', () => {
        render(<AutoTextarea value="hello" onChange={jest.fn()} />);
        expect(screen.getByRole('textbox')).toHaveValue('hello');
    });

    it('calls onChange with new value on user input', () => {
        const onChange = jest.fn();
        render(<AutoTextarea value="" onChange={onChange} />);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new text' } });
        expect(onChange).toHaveBeenCalledWith('new text');
    });

    it('renders with placeholder', () => {
        render(<AutoTextarea value="" onChange={jest.fn()} placeholder="Enter text" />);
        expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('uses rows={1} so CSS/JS controls the height', () => {
        render(<AutoTextarea value="" onChange={jest.fn()} />);
        expect(screen.getByRole('textbox')).toHaveAttribute('rows', '1');
    });
});
