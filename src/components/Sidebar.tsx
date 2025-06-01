import AppButton from '@/components/ui/AppButton';
import { NextRouter, useRouter } from 'next/router';
import React, { JSX, MouseEventHandler } from 'react';

interface AvailableTool {
    name: string;
    link: string;
}

const availableTools: AvailableTool[] = [
    { name: 'String Utils', link: '/string-utils' },
    { name: 'Code Editor', link: '/code-editor' },
    { name: 'Code Formatter', link: '/code-formatter' },
    { name: 'Hashing Tools', link: '/hashing-tools' },
    { name: 'Encoding Tools', link: '/encoding-tools' },
    { name: 'Terminal Utils', link: '/terminal-utils' },
    // { name: 'Converting Tools', link: '/converting-tools' }, //TODO: Feature releases
    { name: 'Markdown Tools', link: '/markdown-tools' },
    // { name: 'Date Tools', link: '/date-tools' },
    { name: 'Git Cheat-sheet', link: '/git-cheat-sheet' },
    // { name: 'MacOS Cheat-sheet', link: '/mac-os-cheat-sheet' }, //TODO: Feature releases
    // { name: 'Windows Cheat-sheet', link: '/windows-cheat-sheet' }, //TODO: Feature releases
    // { name: 'Prompts Collection', link: '/prompts-collection' }, //TODO: Feature releases
];

interface SideBarButtonProps {
    router: NextRouter;
    tool: AvailableTool;
}

const SideBarButton: React.FC<SideBarButtonProps> = ({ router, tool }) => {
    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        router.push(tool.link).catch((err: unknown) => {
            console.error(err);
        });
    };

    return <AppButton name={tool.name} onClick={handleClick} className="sideBarBtn" />;
};

const Sidebar: React.FC = () => {
    const router = useRouter();

    const toolsButtons: JSX.Element[] = availableTools.map((tool) => (
        <SideBarButton key={tool.name} router={router} tool={tool} />
    ));

    return <aside className="sideBarConfig sideBarStyle">{toolsButtons}</aside>;
};

export default Sidebar;
