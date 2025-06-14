import React from 'react';
import Button from '../../../../custom-components/controls/Button';

export type SideBarItem = { itemName: string; itemLink: string };
export type SidebarProps = { sidebarItems: SideBarItem[]; onItemClick: (sideBarItem: SideBarItem) => void };

const Sidebar: React.FC<SidebarProps> = (props) => {
    const mappedItems = props.sidebarItems.map((item) => {
        const handleOnClick = () => {
            props.onItemClick(item);
        };
        return (
            <Button
                key={item.itemLink}
                text={item.itemName}
                onClick={handleOnClick}
                variant="outlined"
                colorStyle={'primary-color'}
                block={true}
            />
        );
    });
    return <aside className="side-bar">{mappedItems}</aside>;
};

export default Sidebar;
