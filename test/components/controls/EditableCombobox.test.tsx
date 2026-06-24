import { fireEvent, render, screen } from '@testing-library/react';
import EditableCombobox from '../../../src/components/controls/EditableCombobox';

describe('EditableCombobox', () => {
    const opts = ['TypeScript', 'Python', 'Go'];

    it('renders input with current value', () => {
        render(<EditableCombobox value="Python" onChange={jest.fn()} options={opts} />);
        expect(screen.getByRole('combobox')).toHaveValue('Python');
    });

    it('has aria-expanded="false" when closed', () => {
        render(<EditableCombobox value="" onChange={jest.fn()} options={opts} />);
        expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens listbox on focus and shows all options', () => {
        render(<EditableCombobox value="" onChange={jest.fn()} options={opts} />);
        fireEvent.focus(screen.getByRole('combobox'));
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    it('calls onChange when an option is clicked', () => {
        const onChange = jest.fn();
        render(<EditableCombobox value="" onChange={onChange} options={opts} />);
        fireEvent.focus(screen.getByRole('combobox'));
        fireEvent.mouseDown(screen.getByRole('option', { name: 'Go' }));
        expect(onChange).toHaveBeenCalledWith('Go');
    });

    it('calls onChange on text input change', () => {
        const onChange = jest.fn();
        render(<EditableCombobox value="" onChange={onChange} options={opts} />);
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Rust' } });
        expect(onChange).toHaveBeenCalledWith('Rust');
    });

    it('closes listbox on Escape', () => {
        render(<EditableCombobox value="" onChange={jest.fn()} options={opts} />);
        const input = screen.getByRole('combobox');
        fireEvent.focus(input);
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        fireEvent.keyDown(input, { key: 'Escape' });
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('shows custom-entry option when allowCustom=true and value not in options', () => {
        render(<EditableCombobox value="Rust" onChange={jest.fn()} options={opts} allowCustom={true} />);
        fireEvent.focus(screen.getByRole('combobox'));
        expect(screen.getByText(/Use "Rust"/)).toBeInTheDocument();
    });

    it('does NOT show custom-entry option when allowCustom=false', () => {
        render(<EditableCombobox value="Rust" onChange={jest.fn()} options={opts} allowCustom={false} />);
        fireEvent.focus(screen.getByRole('combobox'));
        expect(screen.queryByText(/Use "Rust"/)).not.toBeInTheDocument();
    });

    it('ArrowDown navigates to first option', () => {
        render(<EditableCombobox value="" onChange={jest.fn()} options={opts} />);
        const input = screen.getByRole('combobox');
        fireEvent.focus(input);
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        const firstOpt = screen.getAllByRole('option')[0];
        expect(firstOpt).toHaveClass('ecb-option-active');
    });

    it('Enter on highlighted option calls onChange', () => {
        const onChange = jest.fn();
        render(<EditableCombobox value="" onChange={onChange} options={opts} />);
        const input = screen.getByRole('combobox');
        fireEvent.focus(input);
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChange).toHaveBeenCalledWith('TypeScript');
    });

    it('applies aria-label to input', () => {
        render(<EditableCombobox value="" onChange={jest.fn()} options={opts} aria-label="Language" />);
        expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', 'Language');
    });
});
