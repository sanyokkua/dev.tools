import { Button, Flex } from '@chakra-ui/react';
import { NextRouter, useRouter } from 'next/router';
import React, { JSX, MouseEventHandler } from 'react';

type AvailableTool = { name: string; link: string };

const availableTools: AvailableTool[] = [
    { name: 'String Utils', link: '/string-utils' },
    { name: 'Code Editor', link: '/code-editor' },
    { name: 'Code Formatter', link: '/code-formatter' },
    { name: 'Hashing Tools', link: '/hashing-tools' },
    { name: 'Terminal Utils', link: '/terminal-utils' },
    { name: 'Converting Tools', link: '/converting-tools' },
    { name: 'Markdown Tools', link: '/markdown-tools' },
    { name: 'Date Tools', link: '/date-tools' },
    { name: 'Git Cheat-sheet', link: '/git-cheat-sheet' },
    { name: 'MacOS Cheat-sheet', link: '/mac-os-cheat-sheet' },
    { name: 'Windows Cheat-sheet', link: '/windows-cheat-sheet' },
    { name: 'Prompts Collection', link: '/prompts-collection' },
];

type SideBarButtonProps = {
    router: NextRouter;
    tool: AvailableTool;
}

const SideBarButton: React.FC<SideBarButtonProps> = ({router, tool})=>{
    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        router.push(tool.link).catch((reason: unknown) => {
            console.log(String(reason));
        });
    };
    const builtId = tool.name.toLowerCase().replace(/\s/g, '-');
    return (
        <Button w="90%" mb="2" variant="subtle" colorPalette={'blue'} onClick={handleClick} key={builtId}>
            {tool.name}
        </Button>
    );
}

const Sidebar: React.FC = () => {
    const router: NextRouter = useRouter();
    const toolsButtons: JSX.Element[] = availableTools.map((tool) => {
        return <SideBarButton key={tool.name} tool={tool} router={router}/>
    });
    return (
        <Flex
            w={'15vw'}
            h="100vv"
            direction="column"
            pt="5"
            alignItems="center"
            colorPalette={'blue'}
            bg={{ base: 'blue.50' }}
            color="white"
            boxShadow="sm"
        >
            {toolsButtons}
        </Flex>
    );
};

export default Sidebar;
