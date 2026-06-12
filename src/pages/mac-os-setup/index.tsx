import { usePage } from '@/contexts/PageContext';
import React, { useEffect } from 'react';

const IndexPage = (): React.JSX.Element => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('macOS Setup');
    }, [setPageTitle]);

    return (
        <div>
            <h1>macOS Setup</h1>
            <p>Welcome to your macOS Setup. This is the main content area.</p>
        </div>
    );
};

export default IndexPage;
