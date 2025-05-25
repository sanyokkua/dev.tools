import { Box, Heading, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { usePage } from '../../contexts/PageContext';

const IndexPage = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('MacOS Cheat Sheet');
    }, [setPageTitle]);

    return (
        <Box>
            <Heading mb={4}>Dashboard</Heading>
            <Text>Welcome to your MacOS Cheat Sheet. This is the main content area.</Text>
        </Box>
    );
};

export default IndexPage;
