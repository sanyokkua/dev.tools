import { Button, HStack, Menu, Portal, Text } from '@chakra-ui/react';
import { type SelectionDetails } from '@zag-js/menu';
import React from 'react';
import { LuChevronRight } from 'react-icons/lu';
import AppButton from '@/components/elements/AppButton';

export enum MenuItemType {
    BUTTON = 'button',
    SUBMENU = 'submenu',
    SUBMENU_ITEM = 'submenu-item',
}

export type OnSubmenuItemClick = (details: SelectionDetails) => void;
export type OnBtnClick = () => void;
export type SubMenuItem = { text: string; itemId: string };

interface BaseMenuItemConfig {
    text: string;
    itemId: string;
}

interface ButtonConfig extends BaseMenuItemConfig {
    type: MenuItemType.BUTTON;
    onBtnClick: OnBtnClick;
}

interface SubMenuItemActionConfig extends BaseMenuItemConfig {
    type: MenuItemType.SUBMENU_ITEM;
}

interface SubMenuConfig extends BaseMenuItemConfig {
    type: MenuItemType.SUBMENU;
    items: Array<SubMenuItemActionConfig | SubMenuConfig>;
    onItemClick?: OnSubmenuItemClick;
}

export type TopLevelMenuItemConfig = ButtonConfig | SubMenuConfig;

export interface PageMenuBarProps {
    menuItems: TopLevelMenuItemConfig[];
}

function newTopBtn(text: string, itemId: string, onClick: OnBtnClick): ButtonConfig {
    return { type: MenuItemType.BUTTON, text, itemId, onBtnClick: onClick };
}

function newSubMenuItemAction(text: string, itemId: string): SubMenuItemActionConfig {
    return { type: MenuItemType.SUBMENU_ITEM, text, itemId };
}

function newSubMenu(
    text: string,
    itemId: string,
    items: Array<SubMenuItemActionConfig | SubMenuConfig> = [],
    onItemClick?: OnSubmenuItemClick,
): SubMenuConfig {
    return { type: MenuItemType.SUBMENU, text, itemId, items, onItemClick };
}

export class SubMenuBuilder {
    private items: Array<SubMenuItemActionConfig | SubMenuConfig> = [];
    private onItemClickHandler?: OnSubmenuItemClick;

    constructor(
        private text: string,
        private itemId: string,
        onItemClick?: OnSubmenuItemClick,
    ) {
        this.onItemClickHandler = onItemClick;
    }

    static newBuilder(text: string, itemId: string, onItemClick?: OnSubmenuItemClick): SubMenuBuilder {
        return new SubMenuBuilder(text, itemId, onItemClick);
    }

    addItem(text: string, itemId: string): this {
        this.items.push(newSubMenuItemAction(text, itemId));
        return this;
    }

    addItems(items: SubMenuItem[]): this {
        items.forEach((item) => this.items.push(newSubMenuItemAction(item.text, item.itemId)));
        return this;
    }

    addSubMenu(subMenu: SubMenuConfig): this {
        this.items.push(subMenu);
        return this;
    }

    setOnItemClick(handler: OnSubmenuItemClick): this {
        this.onItemClickHandler = handler;
        return this;
    }

    build(): SubMenuConfig {
        return newSubMenu(this.text, this.itemId, this.items, this.onItemClickHandler);
    }
}

export class MenuBuilder {
    private menuItems: Array<TopLevelMenuItemConfig> = [];

    static newBuilder(): MenuBuilder {
        return new MenuBuilder();
    }

    addButton(text: string, itemId: string, onClick: OnBtnClick): this {
        this.menuItems.push(newTopBtn(text, itemId, onClick));
        return this;
    }

    addSubMenu(subMenu: SubMenuConfig): this {
        this.menuItems.push(subMenu);
        return this;
    }

    build(): Array<TopLevelMenuItemConfig> {
        return this.menuItems;
    }
}

const createNestedMenuTrigger = (subMenuConfig: SubMenuConfig) => (
    <Menu.TriggerItem>
        <HStack width="100%" justifyContent="space-between">
            <Text as="span">{subMenuConfig.text}</Text>
            <LuChevronRight />
        </HStack>
    </Menu.TriggerItem>
);

const createTopMenuTrigger = (subMenuConfig: SubMenuConfig) => (
    <Menu.Trigger asChild>
        <Button variant="outline" size="sm">
            {subMenuConfig.text}
        </Button>
    </Menu.Trigger>
);

const ConfiguredMenu: React.FC<{ subMenuConfig: SubMenuConfig; isNested: boolean }> = React.memo(
    ({ subMenuConfig, isNested }) => {
        const trigger = isNested ? createNestedMenuTrigger(subMenuConfig) : createTopMenuTrigger(subMenuConfig);

        const content = subMenuConfig.items.map((item) => {
            if (item.type === MenuItemType.SUBMENU_ITEM) {
                return (
                    <Menu.Item key={item.itemId} value={item.itemId}>
                        {item.text}
                    </Menu.Item>
                );
            }
            // item.type === MenuItemType.SUBMENU
            return <ConfiguredMenu key={item.itemId} subMenuConfig={item} isNested={true} />;
        });

        return (
            <Menu.Root
                positioning={isNested ? { placement: 'right-start', gutter: 2 } : {}}
                onSelect={subMenuConfig.onItemClick}
            >
                {trigger}
                <Portal>
                    <Menu.Positioner>
                        <Menu.Content>{content}</Menu.Content>
                    </Menu.Positioner>
                </Portal>
            </Menu.Root>
        );
    },
);

const mapButton = (item: ButtonConfig) => (
    <Button key={item.itemId} variant="outline" size="sm" onClick={item.onBtnClick}>
        {item.text}
    </Button>
);

const mapMenu = (item: SubMenuConfig) => <ConfiguredMenu key={item.itemId} subMenuConfig={item} isNested={false} />;

const mapMenuItems = (item: TopLevelMenuItemConfig) => {
    switch (item.type) {
        case MenuItemType.BUTTON:
            return mapButton(item);
        case MenuItemType.SUBMENU:
            return mapMenu(item);
        default:
            return <></>;
    }
};

const PageMenuBar: React.FC<PageMenuBarProps> = React.memo(({ menuItems }) => (
    <HStack as="nav" justify="flex-start" colorPalette={'blue'}>
        {menuItems.map(mapMenuItems)}
    </HStack>
));
PageMenuBar.displayName = 'PageMenuBar'; // For better debugging

export default PageMenuBar;
