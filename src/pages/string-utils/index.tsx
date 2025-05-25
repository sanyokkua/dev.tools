import ColumnView from '@/components/customs/column/ColumnView';
import { Box } from '@chakra-ui/react';
import { useEffect } from 'react';
import { usePage } from '@/contexts/PageContext';

const IndexPage = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('String Utilities Page');
    }, [setPageTitle]);

    return (
        <Box>
            <ColumnView />
        </Box>
    );
};

export default IndexPage;
