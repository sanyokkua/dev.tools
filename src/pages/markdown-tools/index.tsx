import { Box, Heading, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { usePage } from '../../contexts/PageContext';

const IndexPage = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Markdown Utilities');
    }, [setPageTitle]);

    return (
        <Box>
            <Heading mb={4}>Dashboard</Heading>
            <Text>Welcome to your Markdown Utilities. This is the main content area.</Text>
        </Box>
    );
};

export default IndexPage;
