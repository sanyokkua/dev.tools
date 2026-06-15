'use client';
import { useRouter } from 'next/router';
import React from 'react';
import type { NavGroup } from '../elements/navigation/sidebar/Sidebar';
import Sidebar from '../elements/navigation/sidebar/Sidebar';

const navGroups: NavGroup[] = [
    {
        groupName: 'Text & Code',
        items: [
            { itemName: 'Dashboard', itemLink: '/', icon: '▦' },
            { itemName: 'String Utils', itemLink: '/string-utils', icon: 'Ⓢ' },
            { itemName: 'JSON Formatter', itemLink: '/json-formatter', icon: '{}' },
            { itemName: 'Hashing Tools', itemLink: '/hashing-tools', icon: '#' },
            { itemName: 'Encoding Tools', itemLink: '/encoding-tools', icon: '⇄' },
            { itemName: 'Terminal Utils', itemLink: '/terminal-utils', icon: '>_' },
            { itemName: 'Code Editor', itemLink: '/code-editor', icon: '‹›' },
            { itemName: 'Markdown Tools', itemLink: '/markdown-tools', icon: '¶' },
            { itemName: 'Converting Tools', itemLink: '/converting-tools', icon: '⇆' },
            { itemName: 'Date Tools', itemLink: '/date-tools', icon: '◷' },
        ],
    },
    {
        groupName: 'Install & Setup',
        items: [
            { itemName: 'Software Installer', itemLink: '/software-installer', icon: '⚙' },
            { itemName: 'macOS Setup', itemLink: '/mac-os-setup', icon: '⌘' },
            { itemName: 'Windows Setup', itemLink: '/windows-setup', icon: '⊞' },
            { itemName: 'Linux Setup', itemLink: '/linux-setup', icon: '🐧' },
            { itemName: 'Git Cheat-sheet', itemLink: '/git-cheat-sheet', icon: '⎇' },
        ],
    },
    {
        groupName: 'AI',
        items: [
            { itemName: 'LLM VRAM Calculator', itemLink: '/llm-vram-calculator', icon: '▤' },
            { itemName: 'Prompts Collection', itemLink: '/prompts-collection', icon: '❝' },
        ],
    },
];

interface SidebarWrapperProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

const ApplicationSidebar: React.FC<SidebarWrapperProps> = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
    const router = useRouter();
    return (
        <Sidebar
            groups={navGroups}
            activeLink={router.pathname}
            isOpen={isOpen}
            onClose={onClose}
            isCollapsed={isCollapsed}
            onToggleCollapse={onToggleCollapse}
        />
    );
};

export default ApplicationSidebar;
