'use client';
import Link from 'next/link';
import React from 'react';

export type NavItem = { itemName: string; itemLink: string; icon: string; badge?: 'NEW' | 'SOON' };
export type NavGroup = { groupName: string; items: NavItem[] };
export type SideBarItem = NavItem;

export type SidebarProps = {
    groups: NavGroup[];
    activeLink: string;
    isOpen?: boolean;
    onClose?: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ groups, activeLink, isOpen, onClose, isCollapsed, onToggleCollapse }) => {
    return (
        <>
            {isOpen && <div className="nav-backdrop" onClick={onClose} aria-hidden="true" />}
            <aside
                className={'nav-rail' + (isOpen ? ' open' : '') + (isCollapsed ? ' collapsed' : '')}
                role="navigation"
                aria-label="Site navigation"
            >
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
                                    onClick={onClose}
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
                <button
                    className="nav-collapse-btn"
                    onClick={onToggleCollapse}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? '›' : '‹'}
                </button>
            </aside>
        </>
    );
};

export default Sidebar;
