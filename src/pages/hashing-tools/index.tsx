import { usePage } from '@/contexts/PageContext';
import React, { useEffect } from 'react';
import HashingPage from './HashingPage';

const Home: React.FC = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Hashing Tools');
    }, [setPageTitle]);
    return <HashingPage />;
};

export default Home;
