import { usePage } from '@/contexts/PageContext';
import React, { useEffect } from 'react';
import JsonFormatterPage from './JsonFormatterPage';

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('JSON Formatter');
    }, [setPageTitle]);
    return <JsonFormatterPage />;
};

export default IndexPage;
