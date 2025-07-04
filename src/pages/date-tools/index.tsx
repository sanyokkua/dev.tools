'use client';
import { usePage } from '@/contexts/PageContext';
import { useEffect } from 'react';

const IndexPage = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Date Utilities');
    }, [setPageTitle]);

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to your Date Utilities. This is the main content area.</p>
        </div>
    );
};

export default IndexPage;
