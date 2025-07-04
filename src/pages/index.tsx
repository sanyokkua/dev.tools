'use client';
import { usePage } from '@/contexts/PageContext';
import { useEffect } from 'react';

const Home = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Main Page');
    }, [setPageTitle]);

    return (
        <div>
            <h2>Dashboard</h2>
            <p>Welcome to your dashboard. This is the main content area.</p>
        </div>
    );
};

export default Home;
