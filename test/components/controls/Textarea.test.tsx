import { fireEvent, render, screen } from '@testing-library/react';
import Textarea from '../../../src/components/controls/Textarea';

describe('Textarea', () => {
    it('renders a textarea element', () => {
        render(<Textarea />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with given value', () => {
        render(<Textarea value="hello" />);
        expect(screen.getByRole('textbox')).toHaveValue('hello');
    });

    it('calls onChange with new value', () => {
        const onChange = jest.fn();
        render(<Textarea value="" onChange={onChange} />);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'typed text' } });
        expect(onChange).toHaveBeenCalledWith('typed text');
    });

    it('does not call onChange when disabled', () => {
        const onChange = jest.fn();
        render(<Textarea value="" onChange={onChange} disabled />);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'typed text' } });
        expect(onChange).not.toHaveBeenCalled();
    });

    it('does not call onChange when readOnly', () => {
        const onChange = jest.fn();
        render(<Textarea value="" onChange={onChange} readOnly />);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'typed text' } });
        expect(onChange).not.toHaveBeenCalled();
    });

    it('renders placeholder', () => {
        render(<Textarea placeholder="Enter text…" />);
        expect(screen.getByPlaceholderText('Enter text…')).toBeInTheDocument();
    });

    it('propagates id prop', () => {
        render(<Textarea id="my-textarea" />);
        expect(screen.getByRole('textbox')).toHaveAttribute('id', 'my-textarea');
    });

    it('propagates aria-label prop', () => {
        render(<Textarea aria-label="My label" />);
        expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'My label');
    });

    it('propagates rows prop', () => {
        render(<Textarea rows={6} />);
        expect(screen.getByRole('textbox')).toHaveAttribute('rows', '6');
    });
});
