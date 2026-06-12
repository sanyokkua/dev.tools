import { usePage } from '@/contexts/PageContext';
import React, { useEffect } from 'react';

const IndexPage = (): React.JSX.Element => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Windows Setup');
    }, [setPageTitle]);

    return (
        <div>
            <h1>Windows Setup</h1>
            <p>Welcome to your Windows Setup. This is the main content area.</p>
        </div>
    );
};

export default IndexPage;
