import React from 'react';

interface AppMenuBarButtonProps {
    id: string;
    text: string;
    onClick: () => void;
}

const AppMenuBarButton: React.FC<AppMenuBarButtonProps> = ({ id, text, onClick }) => {
    return (
        <li key={id} className="menuBarNavItem">
            <a className="menuBarNavLink" onClick={onClick}>
                {text}
            </a>
        </li>
    );
};

export default AppMenuBarButton;
