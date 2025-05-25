import { Box, Button, Flex } from '@chakra-ui/react';
import { NextRouter, useRouter } from 'next/router';
import { JSX, MouseEventHandler } from 'react';

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

const Sidebar = () => {
    const router: NextRouter = useRouter();
    const toolsButtons: JSX.Element[] = availableTools.map((tool) => {
        const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
            e.preventDefault();
            router.push(tool.link);
        };
        const builtId = tool.name.toLowerCase().replace(/\s/g, '-');
        return (
            <Button w="90%" mb="2" variant="subtle" colorPalette={'blue'} onClick={handleClick} key={builtId}>
                {tool.name}
            </Button>
        );
    });
    return (
        <Box borderRight="1px" w={'15%'} h="full">
            <Flex direction="column" h="full" pt="5">
                <Flex alignItems="center" flexDirection="column">
                    {toolsButtons}
                </Flex>
            </Flex>
        </Box>
    );
};

export default Sidebar;
