import { usePage } from '@/contexts/PageContext';
import ToolAbout from '@/controls/ToolAbout';
import React, { useEffect } from 'react';
import HashingPage from './HashingPage';

const Home: React.FC = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Hashing Tools');
    }, [setPageTitle]);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <ToolAbout routeKey="hashing-tools" title="Hashing Tools">
                Generate cryptographic hashes (MD5, SHA-1, SHA-256, SHA-512) from text input.
            </ToolAbout>
            <HashingPage />
        </div>
    );
};

export default Home;
