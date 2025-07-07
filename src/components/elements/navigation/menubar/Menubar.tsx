'use client';
import { FC, memo } from 'react';
import { MenuItems, MenuItemType } from './types';

interface MenuBarProps {
    menuItems: MenuItems[];
}

const Menubar: FC<MenuBarProps> = memo(({ menuItems }) => {
    const mappedItems = menuItems.map((item) => {
        if (item.type === MenuItemType.BUTTON) {
            return (
                <li key={item.id} className="menubar-menu-button-item">
                    <a
                        className="menubar-menu-button"
                        onClick={(e) => {
                            e.preventDefault();
                            item.onItemClick(item);
                        }}
                    >
                        {item.text}
                    </a>
                </li>
            );
        }

        const listItems = item.items.map((it) => {
            return (
                <a
                    className="menubar-menu-button-dropdown-item menubar-menu-button-dropdown-item-border"
                    key={it.id}
                    onClick={(e) => {
                        e.preventDefault();
                        it.onItemClick(it);
                    }}
                >
                    {it.text}
                </a>
            );
        });
        return (
            <li key={item.id} className="menubar-menu-button-item menubar-menu-button-dropdown">
                <a
                    className="menubar-menu-button menubar-menu-button-dropdown-item"
                    onClick={(e) => {
                        e.preventDefault();
                    }}
                >
                    {item.text}
                </a>
                <div className="menubar-menu-button-dropdown-content">{listItems}</div>
            </li>
        );
    });

    return <ul className="menubar-container">{mappedItems}</ul>;
});

Menubar.displayName = 'Menubar';

export default Menubar;
