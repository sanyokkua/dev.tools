import AppMenuBarSubmenuItem from '@/components/elements/menuBar/AppMenuBarSubmenuItem';
import { SubmenuItem, SubmenuItemClickHandler } from '@/components/elements/menuBar/types';
import React, { MouseEvent } from 'react';

interface AppMenuBarSubmenuProps {
    text: string;
    onItemClick: SubmenuItemClickHandler;
    items: SubmenuItem[];
}

const AppMenuBarSubmenu: React.FC<AppMenuBarSubmenuProps> = ({ text, items, onItemClick }) => {
    const stubOnClick = (e: MouseEvent) => {
        e.preventDefault();
    };

    const listItems = items.map((it) => {
        return <AppMenuBarSubmenuItem id={it.id} text={it.text} onItemClick={onItemClick} />;
    });

    return (
        <li className="menuBarNavItem menuBarDropdown">
            <a className="menuBarNavLink menuBarDropdownLink" onClick={stubOnClick}>
                {text}
            </a>
            <div className="menuBarDropdownMenu">{listItems}</div>
        </li>
    );
};

export default AppMenuBarSubmenu;
