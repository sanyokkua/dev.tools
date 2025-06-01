import AppMenuBarButton from '@/components/elements/menuBar/AppMenuBarButton';
import AppMenuBarContainer from '@/components/elements/menuBar/AppMenuBarContainer';
import AppMenuBarSubmenu from '@/components/elements/menuBar/AppMenuBarSubmenu';
import { FC, memo } from 'react';
import { MenuItemType, TopLevelMenuItem } from './types';

interface MenuBarProps {
    menuItems: TopLevelMenuItem[];
}

const MenuBar: FC<MenuBarProps> = memo(({ menuItems }) => {
    const mappedItems = menuItems.map((item) => {
        if (item.type === MenuItemType.BUTTON) {
            return <AppMenuBarButton id={item.id} text={item.text} onClick={item.onClick} />;
        }
        return <AppMenuBarSubmenu text={item.text} onItemClick={item.onItemClick} items={item.items} />;
    });
    return <AppMenuBarContainer>{mappedItems}</AppMenuBarContainer>;
});

MenuBar.displayName = 'MenuBar';

export default MenuBar;
