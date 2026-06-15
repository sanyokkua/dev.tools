import { fireEvent, render, screen } from '@testing-library/react';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import { FileSaveDialog } from '../../src/components/controls/SaveFileDialog';

const defaultOptions = {
    fileContent: 'hello world',
    fileName: 'myfile',
    fileExtension: '.md',
    availableExtensions: ['.md', '.txt'],
};

function renderDialog(isOpen: boolean, options = defaultOptions, onClose = jest.fn()) {
    return render(
        <ToasterProvider>
            <FileSaveDialog isOpen={isOpen} options={options} onClose={onClose} />
        </ToasterProvider>,
    );
}

describe('FileSaveDialog', () => {
    it('renders nothing when closed', () => {
        const { container } = renderDialog(false);
        expect(container.querySelector('.modal-backdrop')).toBeNull();
        expect(screen.queryByText('Save File As')).toBeNull();
    });

    it('renders modal title when open', () => {
        renderDialog(true);
        expect(screen.getByText('Save File As')).toBeInTheDocument();
    });

    it('input shows initial fileName value', () => {
        renderDialog(true);
        const input = screen.getByRole<HTMLInputElement>('textbox');
        expect(input.value).toBe('myfile');
    });

    it('input is editable — typed value updates the field', () => {
        renderDialog(true);
        const input = screen.getByRole<HTMLInputElement>('textbox');
        fireEvent.change(input, { target: { value: 'newname' } });
        expect(input.value).toBe('newname');
    });

    it('extension select lists available extensions', () => {
        renderDialog(true);
        const select = screen.getByRole<HTMLSelectElement>('combobox');
        const options = Array.from(select.options).map((o) => o.value);
        expect(options).toContain('.md');
        expect(options).toContain('.txt');
    });

    it('Save button triggers onClose', () => {
        const onClose = jest.fn();
        renderDialog(true, defaultOptions, onClose);
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
        expect(onClose).toHaveBeenCalled();
    });

    it('Cancel button calls onClose', () => {
        const onClose = jest.fn();
        renderDialog(true, defaultOptions, onClose);
        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(onClose).toHaveBeenCalled();
    });

    it('falls back to .txt when fileExtension is not in availableExtensions', () => {
        renderDialog(true, { ...defaultOptions, fileExtension: '.xyz', availableExtensions: ['.txt', '.md'] });
        const select = screen.getByRole<HTMLSelectElement>('combobox');
        expect(select.value).toBe('.txt');
    });

    it('falls back to first extension when neither fileExtension nor .txt is available', () => {
        renderDialog(true, { ...defaultOptions, fileExtension: '.xyz', availableExtensions: ['.md', '.html'] });
        const select = screen.getByRole<HTMLSelectElement>('combobox');
        expect(select.value).toBe('.md');
    });

    it('uses fileExtension when it is in availableExtensions', () => {
        renderDialog(true, { ...defaultOptions, fileExtension: '.txt', availableExtensions: ['.md', '.txt'] });
        const select = screen.getByRole<HTMLSelectElement>('combobox');
        expect(select.value).toBe('.txt');
    });
});
