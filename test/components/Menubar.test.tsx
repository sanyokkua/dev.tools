import { fireEvent, render, screen } from '@testing-library/react';
import Menubar from '../../src/components/elements/navigation/menubar/Menubar';
import { MenuItemType } from '../../src/components/elements/navigation/menubar/types';

describe('Menubar', () => {
    const makeButton = (overrides = {}) => ({
        type: MenuItemType.BUTTON as const,
        id: 'save',
        text: 'Save',
        onItemClick: jest.fn(),
        ...overrides,
    });

    it('renders a <ul> with class menubar-container', () => {
        render(<Menubar menuItems={[]} />);
        expect(document.querySelector('.menubar-container')).toBeInTheDocument();
        expect(document.querySelector('ul.menubar-container')).toBeInTheDocument();
    });

    it('renders button items with their text', () => {
        render(<Menubar menuItems={[makeButton()]} />);
        expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('renders multiple button items', () => {
        const items = [
            makeButton({ id: 'open', text: 'Open' }),
            makeButton({ id: 'save', text: 'Save' }),
            makeButton({ id: 'clear', text: 'Clear' }),
        ];
        render(<Menubar menuItems={items} />);
        expect(screen.getByText('Open')).toBeInTheDocument();
        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('calls onItemClick with the item when a button is clicked', () => {
        const handler = jest.fn();
        const item = makeButton({ onItemClick: handler });
        render(<Menubar menuItems={[item]} />);
        fireEvent.click(screen.getByText('Save'));
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ id: 'save', text: 'Save' }));
    });

    it('renders a dropdown submenu with its trigger text', () => {
        const submenu = {
            type: MenuItemType.SUBMENU as const,
            id: 'file',
            text: 'File',
            items: [
                { type: MenuItemType.SUBMENU_ITEM as const, id: 'new', text: 'New File', onItemClick: jest.fn() },
                { type: MenuItemType.SUBMENU_ITEM as const, id: 'open', text: 'Open File', onItemClick: jest.fn() },
            ],
        };
        render(<Menubar menuItems={[submenu]} />);
        expect(screen.getByText('File')).toBeInTheDocument();
        expect(screen.getByText('New File')).toBeInTheDocument();
        expect(screen.getByText('Open File')).toBeInTheDocument();
    });

    it('calls onItemClick when a dropdown item is clicked', () => {
        const handler = jest.fn();
        const submenu = {
            type: MenuItemType.SUBMENU as const,
            id: 'file',
            text: 'File',
            items: [{ type: MenuItemType.SUBMENU_ITEM as const, id: 'new', text: 'New File', onItemClick: handler }],
        };
        render(<Menubar menuItems={[submenu]} />);
        fireEvent.click(screen.getByText('New File'));
        expect(handler).toHaveBeenCalledTimes(1);
    });
});
