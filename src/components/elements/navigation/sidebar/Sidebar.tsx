'use client';
import Link from 'next/link';
import React from 'react';

export type NavItem = { itemName: string; itemLink: string; icon: string; badge?: 'NEW' | 'SOON' };
export type NavGroup = { groupName: string; items: NavItem[] };
export type SideBarItem = NavItem;

export type SidebarProps = { groups: NavGroup[]; activeLink: string };

const Sidebar: React.FC<SidebarProps> = ({ groups, activeLink }) => {
    return (
        <aside className="nav-rail" role="navigation" aria-label="Site navigation">
            {groups.map((group) => (
                <div key={group.groupName}>
                    <div className="nav-group-label">{group.groupName}</div>
                    {group.items.map((item) => {
                        const isActive = activeLink === item.itemLink;
                        return (
                            <Link
                                key={item.itemLink}
                                href={item.itemLink}
                                className={'nav-item' + (isActive ? ' active' : '')}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <span aria-hidden="true">{item.icon}</span>
                                <span>{item.itemName}</span>
                                {item.badge && (
                                    <span className={'nav-badge ' + item.badge.toLowerCase()}>{item.badge}</span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            ))}
        </aside>
    );
};

export default Sidebar;
