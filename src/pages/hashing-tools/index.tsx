import { Box, Heading, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { usePage } from '../../contexts/PageContext';

const Home = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Hashing Utilities Page');
    }, [setPageTitle]);

    return (
        <Box>
            <Heading mb={4}>Dashboard</Heading>
            <Text>Welcome to your Hashing tools. This is the main content area.</Text>
        </Box>
    );
};

export default Home;
