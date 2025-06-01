import {
    ButtonMenuItem,
    MenuButtonClickHandler,
    MenuItemType,
    SubmenuItem,
    SubmenuItemClickHandler,
    SubmenuItemTypeless,
    SubmenuMenuItem,
    TopLevelMenuItem,
} from './types';

export class MenuBuilder {
    private menuItems: TopLevelMenuItem[] = [];

    public static newBuilder(): MenuBuilder {
        return new MenuBuilder();
    }

    public addButton(id: string, text: string, onClick: MenuButtonClickHandler): this {
        const btn: ButtonMenuItem = { type: MenuItemType.BUTTON, id, text, onClick };
        this.menuItems.push(btn);
        return this;
    }

    public addSubmenu(id: string, text: string, onItemClick: SubmenuItemClickHandler): SubmenuBuilder {
        return new SubmenuBuilder(this, id, text, onItemClick);
    }

    public build(): TopLevelMenuItem[] {
        return [...this.menuItems];
    }
}

class SubmenuBuilder {
    private items: SubmenuItem[] = [];

    constructor(
        private parent: MenuBuilder,
        private id: string,
        private text: string,
        private onItemClick: SubmenuItemClickHandler,
    ) {}

    public addItem(id: string, text: string): this {
        this.items.push({ type: MenuItemType.SUBMENU_ITEM, id, text });
        return this;
    }

    public addItems(list: SubmenuItemTypeless[]): this {
        list.forEach((item: SubmenuItemTypeless) => {
            this.items.push({ type: MenuItemType.SUBMENU_ITEM, id: item.id, text: item.text });
        });
        return this;
    }

    public end(): MenuBuilder {
        const menu: SubmenuMenuItem = {
            type: MenuItemType.SUBMENU,
            id: this.id,
            text: this.text,
            items: this.items,
            onItemClick: this.onItemClick,
        };
        this.parent['menuItems'].push(menu);
        return this.parent;
    }
}
