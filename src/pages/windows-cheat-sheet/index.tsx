import { usePage } from '@/contexts/PageContext';
import { useEffect } from 'react';

const IndexPage = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Windows Cheat Sheet');
    }, [setPageTitle]);

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to your Windows Cheat Sheet. This is the main content area.</p>
        </div>
    );
};

export default IndexPage;
