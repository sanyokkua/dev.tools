import React, {useState} from "react";
import type {MenuProps} from "antd";
import {Breadcrumb, Layout, Menu, theme} from "antd";
import {NextRouter, useRouter} from "next/router";
import {ItemType as BreadCrumbItemType} from "antd/es/breadcrumb/Breadcrumb";
import {MenuDividerType, MenuItemGroupType, MenuItemType, SubMenuType} from "antd/es/menu/hooks/useItems";

type ItemType = MenuItemType | SubMenuType | MenuItemGroupType | MenuDividerType;
const {Header, Content, Sider} = Layout;

type PageInfo = {
    title: string;
    href: string;
};
const APP_PAGES: PageInfo[] = [
    {title: "Home", href: "/"},
    {title: "String Utils", href: "/string"},
    {title: "JSON Utils", href: "/json"},
    {title: "Terminal Utils", href: "terminal"},
    {title: "Git Setup", href: "git"},
    {title: "Mac OS Setup", href: "macos"},
    {title: "Windows Setup", href: "windows"},
];

export type PageMenuItem = {
    title: string;
    onClick?: () => void;
    children?: PageMenuItem[];
};

export function mapPageMenuItemsToMenuPropsItems(items: PageMenuItem[]): MenuProps["items"] {
    return items.map((item: PageMenuItem) => {
        return mapMenuItem(item);
    });
}

function mapMenuItem(item: PageMenuItem): ItemType {
    let children = undefined;

    if (item.children && item.children.length > 0) {
        children = item.children.map((item) => {
            return mapMenuItem(item);
        });
    }

    const onClickHandler = item.onClick ? item.onClick : undefined;
    return {
        key: item.title,
        label: item.title,
        onClick: onClickHandler,
        children: children,
    };
}

type AppLayoutProps = {
    menuProps?: MenuProps["items"];
    breadcrumbItems: string[];
    content: JSX.Element;
    showNotification?: boolean;
    showNotificationText?: string;
    showNotificationHeader?: string;
};

const AppLayout: React.FC<AppLayoutProps> = (props: AppLayoutProps) => {
    const {token: {colorBgContainer}} = theme.useToken();
    const [collapsed, setCollapsed] = useState(false);
    const router: NextRouter = useRouter();

    const headerItems: MenuProps["items"] = APP_PAGES.map((key: PageInfo) => {
        return {
            key: key.href,
            label: key.title,
            onClick: (e) => {
                router.push(key.href);
            },
        };
    });

    const sideMenu = props.menuProps ?
        <Sider width={200} style={{background: colorBgContainer}}>
            <Menu mode="inline" style={{height: "100%", borderRight: 0}} items={props.menuProps}/>
        </Sider>
        : undefined;

    const breadcrumbs: BreadCrumbItemType[] = props.breadcrumbItems.map((value: string) => {
        return {title: value};
    });

    return (
        <Layout>
            <Header className="header">
                <div className="logo"/>
                <Menu theme="dark" mode="horizontal" items={headerItems}/>
            </Header>

            <Layout>
                {sideMenu}
                <Layout style={{padding: "0 24px 24px"}}>
                    <Breadcrumb style={{margin: "16px 0"}} items={breadcrumbs}/>
                    <Content style={{margin: 0, minHeight: 280, background: colorBgContainer}}>{props.content}</Content>
                </Layout>

            </Layout>
        </Layout>
    );
};

export default AppLayout;