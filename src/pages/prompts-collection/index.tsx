import { Box, Heading, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { usePage } from '../../contexts/PageContext';

const IndexPage = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Prompts Collection');
    }, [setPageTitle]);

    return (
        <Box>
            <Heading mb={4}>Dashboard</Heading>
            <Text>Welcome to your Prompts Collection. This is the main content area.</Text>
        </Box>
    );
};

export default IndexPage;
