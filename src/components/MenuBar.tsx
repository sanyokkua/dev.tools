import { Box, Flex, Heading } from '@chakra-ui/react';
import Link from 'next/link';
import { usePage } from '../contexts/PageContext';

const MenuBar = () => {
    const { pageTitle } = usePage();

    return (
        <Flex
            as="nav"
            align="center"
            padding={4}
            borderBottomWidth="1px"
            boxShadow="md"
            colorPalette={'blue'}
            bg={{ base: 'blue.800' }}
            color="white"
        >
            {/* Left column: App Name */}
            <Box flex="1">
                <Link href="/">
                    <Heading as="h1" size="md" letterSpacing="tight">
                        Developer Utils
                    </Heading>
                </Link>
            </Box>

            {/* Center column: Page title */}
            <Box flex="1" textAlign="center">
                {pageTitle}
            </Box>

            {/* Right column: empty box to ensure proper centering */}
            <Box flex="1" />
        </Flex>
    );
};

export default MenuBar;
