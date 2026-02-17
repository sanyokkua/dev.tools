'use client';
import { usePage } from '@/contexts/PageContext';
import React, { useEffect } from 'react';

const IndexPage = (): React.JSX.Element => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Converting Tools');
    }, [setPageTitle]);

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to your Converting Tools. This is the main content area.</p>
        </div>
    );
};

export default IndexPage;
