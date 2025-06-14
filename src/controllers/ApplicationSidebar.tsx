import { useRouter } from 'next/router';
import React from 'react';
import Sidebar, { SideBarItem } from './elements/navigation/sidebar/Sidebar';

const sideBarItems: SideBarItem[] = [
    { itemName: 'String Utils', itemLink: '/string-utils' },
    { itemName: 'Code Editor', itemLink: '/code-editor' },
    { itemName: 'Code Formatter', itemLink: '/code-formatter' },
    { itemName: 'Hashing Tools', itemLink: '/hashing-tools' },
    { itemName: 'Encoding Tools', itemLink: '/encoding-tools' },
    { itemName: 'Terminal Utils', itemLink: '/terminal-utils' },
    // { itemName: 'Converting Tools', itemLink: '/converting-tools' }, //TODO: Feature releases
    { itemName: 'Markdown Tools', itemLink: '/markdown-tools' },
    // { itemName: 'Date Tools', itemLink: '/date-tools' },
    { itemName: 'Git Cheat-sheet', itemLink: '/git-cheat-sheet' },
    // { itemName: 'MacOS Cheat-sheet', itemLink: '/mac-os-cheat-sheet' }, //TODO: Feature releases
    // { itemName: 'Windows Cheat-sheet', itemLink: '/windows-cheat-sheet' }, //TODO: Feature releases
    // { itemName: 'Prompts Collection', itemLink: '/prompts-collection' }, //TODO: Feature releases
];

const ApplicationSidebar: React.FC = () => {
    const router = useRouter();

    const handleClick = (item: SideBarItem) => {
        router.push(item.itemLink).catch((err: unknown) => {
            console.error(err);
        });
    };

    return <Sidebar sidebarItems={sideBarItems} onItemClick={handleClick} />;
};

export default ApplicationSidebar;
