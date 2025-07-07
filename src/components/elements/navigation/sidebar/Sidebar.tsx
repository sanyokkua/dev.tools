'use client';
import Button from '@/controls/Button';
import React from 'react';

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
