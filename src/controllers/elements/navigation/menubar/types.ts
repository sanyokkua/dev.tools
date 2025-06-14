export enum MenuItemType {
    BUTTON = 'button',
    SUBMENU = 'submenu',
    SUBMENU_ITEM = 'submenu_item',
}

export interface BaseMenuItem {
    id: string;
    text: string;
}

export type OnMenuItemClick = (item: BaseMenuItem) => void;

export interface MenuItem extends BaseMenuItem {
    onItemClick: OnMenuItemClick;
}

export interface ButtonItem extends MenuItem {
    type: MenuItemType.BUTTON;
}

export interface SubmenuItem extends MenuItem {
    type: MenuItemType.SUBMENU_ITEM;
}

export type SubmenuItemTypeless = Omit<SubmenuItem, 'type'>;

export interface SubmenuMenu extends BaseMenuItem {
    type: MenuItemType.SUBMENU;
    items: SubmenuItem[];
}

export type MenuItems = ButtonItem | SubmenuMenu;
