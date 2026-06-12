import { usePage } from '@/contexts/PageContext';
import React, { useEffect } from 'react';

const IndexPage = (): React.JSX.Element => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Software Installer');
    }, [setPageTitle]);

    return (
        <div>
            <h1>Software Installer</h1>
            <p>Welcome to your Software Installer. This is the main content area.</p>
        </div>
    );
};

export default IndexPage;
