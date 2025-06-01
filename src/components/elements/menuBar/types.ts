export enum MenuItemType {
    BUTTON = 'button',
    SUBMENU = 'submenu',
    SUBMENU_ITEM = 'submenu_item',
}

export type MenuButtonClickHandler = () => void;

export type SubmenuItemClickHandler = (id: string) => void;

export interface BaseMenuItem {
    id: string;
    text: string;
}

export interface ButtonMenuItem extends BaseMenuItem {
    type: MenuItemType.BUTTON;
    onClick: MenuButtonClickHandler;
}

export interface SubmenuItem extends BaseMenuItem {
    type: MenuItemType.SUBMENU_ITEM;
}

export type SubmenuItemTypeless = Omit<SubmenuItem, 'type'>;

export interface SubmenuMenuItem extends BaseMenuItem {
    type: MenuItemType.SUBMENU;
    items: SubmenuItem[];
    onItemClick: SubmenuItemClickHandler;
}

export type TopLevelMenuItem = ButtonMenuItem | SubmenuMenuItem;
