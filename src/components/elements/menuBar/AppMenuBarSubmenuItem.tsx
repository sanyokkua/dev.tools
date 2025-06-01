import { SubmenuItemClickHandler } from '@/components/elements/menuBar/types';
import React from 'react';

interface AppMenuBarSubmenuItemProps {
    id: string;
    text: string;
    onItemClick: SubmenuItemClickHandler;
}

const AppMenuBarSubmenuItem: React.FC<AppMenuBarSubmenuItemProps> = ({ id, text, onItemClick }) => {
    return (
        <a
            className="menuBarDropdownLink"
            key={id}
            onClick={(e) => {
                e.preventDefault();
                onItemClick(id);
            }}
        >
            {text}
        </a>
    );
};

export default AppMenuBarSubmenuItem;
