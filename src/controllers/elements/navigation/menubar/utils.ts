import {
    ButtonItem,
    MenuItems,
    MenuItemType,
    OnMenuItemClick,
    SubmenuItem,
    SubmenuItemTypeless,
    SubmenuMenu,
} from './types';

export class MenuBuilder {
    private menuItems: MenuItems[] = [];

    public static newBuilder(): MenuBuilder {
        return new MenuBuilder();
    }

    public addButton(id: string, text: string, handler: OnMenuItemClick): this {
        const btn: ButtonItem = { type: MenuItemType.BUTTON, id, text, onItemClick: handler };
        this.menuItems.push(btn);
        return this;
    }

    public addSubmenu(id: string, text: string): SubmenuBuilder {
        return new SubmenuBuilder(this, id, text);
    }

    public build(): MenuItems[] {
        return [...this.menuItems];
    }
}

class SubmenuBuilder {
    private items: SubmenuItem[] = [];

    constructor(
        private parent: MenuBuilder,
        private id: string,
        private text: string,
    ) {}

    public addItem(id: string, text: string, handler: OnMenuItemClick): this {
        this.items.push({ type: MenuItemType.SUBMENU_ITEM, id, text, onItemClick: handler });
        return this;
    }

    public addItems(list: SubmenuItemTypeless[]): this {
        list.forEach((item: SubmenuItemTypeless) => {
            this.items.push({
                type: MenuItemType.SUBMENU_ITEM,
                id: item.id,
                text: item.text,
                onItemClick: item.onItemClick,
            });
        });
        return this;
    }

    public end(): MenuBuilder {
        const menu: SubmenuMenu = { type: MenuItemType.SUBMENU, id: this.id, text: this.text, items: this.items };
        this.parent['menuItems'].push(menu);
        return this.parent;
    }
}
