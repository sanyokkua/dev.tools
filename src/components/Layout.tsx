import { Toaster } from '@/components/ui/Toaster';
import { Box, Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';
import MenuBar from './MenuBar';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <Flex flexDirection="column">
            {/* Top Menu Bar */}
            <MenuBar />

            <Flex>
                {/* Left Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <Box flex="1" p={4} overflow="auto">
                    {children}
                </Box>
            </Flex>

            <Toaster />
        </Flex>
    );
};

export default Layout;
