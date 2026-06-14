import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { ToasterProvider } from '../../../src/components/contexts/ToasterContext';
import HashingPage from '../../../src/pages/hashing-tools/HashingPage';

jest.mock('monaco-editor', () => ({ editor: { create: jest.fn() } }), { virtual: true });

jest.mock('../../../src/components/elements/editor/CodeEditor', () => ({
    __esModule: true,
    default: (): React.JSX.Element => <div data-testid="code-editor" />,
}));

const renderWithToaster = (): ReturnType<typeof render> =>
    render(
        <ToasterProvider>
            <HashingPage />
        </ToasterProvider>,
    );

function makeFile(content: string): File {
    const bytes = new TextEncoder().encode(content);
    const file = new File([bytes], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(file, 'arrayBuffer', { value: () => Promise.resolve(bytes.buffer) });
    return file;
}

describe('HashingPage drag-and-drop', () => {
    it('applies drag-over class when a file is dragged over the input pane', () => {
        renderWithToaster();
        const pane = screen.getByTestId('hashing-input-pane');
        fireEvent.dragOver(pane, { preventDefault: jest.fn() });
        expect(pane.classList.contains('hashing-input-pane--drag-over')).toBe(true);
    });

    it('removes drag-over class when drag leaves', () => {
        renderWithToaster();
        const pane = screen.getByTestId('hashing-input-pane');
        fireEvent.dragOver(pane, { preventDefault: jest.fn() });
        fireEvent.dragLeave(pane);
        expect(pane.classList.contains('hashing-input-pane--drag-over')).toBe(false);
    });
});

describe('HashingPage — algorithm table', () => {
    it('renders all five algorithm rows', () => {
        renderWithToaster();
        ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].forEach((alg) => {
            expect(screen.getByText(alg)).toBeInTheDocument();
        });
    });

    it('SHA-384 row is present (added in redesign, D6)', () => {
        renderWithToaster();
        expect(screen.getByText('SHA-384')).toBeInTheDocument();
    });

    it('all Copy buttons are disabled when no digest has been computed', () => {
        renderWithToaster();
        const copyBtns = screen.getAllByRole('button', { name: /^copy$/i });
        expect(copyBtns.length).toBeGreaterThan(0);
        copyBtns.forEach((btn) => expect(btn).toBeDisabled());
    });

    it('a hidden file input exists for the "Open File" flow', () => {
        renderWithToaster();
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        expect(fileInput).not.toBeNull();
        expect(fileInput.style.display).toBe('none');
    });

    it('UPPERCASE switch renders unchecked by default', () => {
        renderWithToaster();
        const toggle = screen.getByRole('switch', { name: /uppercase/i });
        expect(toggle).toBeInTheDocument();
        expect(toggle).toHaveAttribute('aria-checked', 'false');
    });
});

describe('HashingPage — file-based hashing', () => {
    it('computes digests and enables Copy buttons after a file is dropped', async () => {
        renderWithToaster();
        const pane = screen.getByTestId('hashing-input-pane');
        const mockFile = makeFile('hello world');

        await act(async () => {
            fireEvent.dragOver(pane, { preventDefault: jest.fn() });
            fireEvent.drop(pane, { preventDefault: jest.fn(), dataTransfer: { files: [mockFile] } });
        });

        await waitFor(
            () => {
                const copyBtns = screen.getAllByRole('button', { name: /^copy$/i });
                const enabledCount = copyBtns.filter((b) => !b.hasAttribute('disabled')).length;
                expect(enabledCount).toBeGreaterThan(0);
            },
            { timeout: 3000 },
        );
    });

    it('Clear button resets all Copy buttons to disabled', async () => {
        renderWithToaster();
        const pane = screen.getByTestId('hashing-input-pane');
        const mockFile = makeFile('hello world');

        await act(async () => {
            fireEvent.drop(pane, { preventDefault: jest.fn(), dataTransfer: { files: [mockFile] } });
        });

        await waitFor(
            () => {
                const enabled = screen
                    .getAllByRole('button', { name: /^copy$/i })
                    .filter((b) => !b.hasAttribute('disabled'));
                expect(enabled.length).toBeGreaterThan(0);
            },
            { timeout: 3000 },
        );

        fireEvent.click(screen.getByRole('button', { name: /^clear$/i }));

        screen.getAllByRole('button', { name: /^copy$/i }).forEach((btn) => {
            expect(btn).toBeDisabled();
        });
    });
});
