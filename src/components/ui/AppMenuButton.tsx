import React from 'react';

interface MenuItem {
    key: string;
    name: string;
}

type MenuButtonProps = { buttonName: string; items: MenuItem[]; onSelect: (selectedKey: string) => void };

const AppMenuButton: React.FC<MenuButtonProps> = (props) => {
    const onLinkClicked = (key: string) => {
        props.onSelect(key);
    };

    const links = props.items.map((item) => (
        <a
            href={item.key}
            onClick={(event) => {
                event.preventDefault();
                onLinkClicked(item.key);
            }}
        >
            {item.name}
        </a>
    ));
    return (
        <div className="menuBarDropdown">
            <button className="menuBarNavLink">{props.buttonName}</button>
            <div className="dropdown-content">{links}</div>
        </div>
    );
};

export default AppMenuButton;
