import { fireEvent, render, screen } from '@testing-library/react';
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
