'use client';
import { usePage } from '@/contexts/PageContext';
import ToolAbout from '@/controls/ToolAbout';
import React, { useEffect } from 'react';
import JwtPage from './JwtPage';

const Home: React.FC = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('JWT');
    }, [setPageTitle]);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <ToolAbout routeKey="jwt" title="JWT">
                Decode, verify, and sign JSON Web Tokens — all operations run locally, secrets never leave your browser.
            </ToolAbout>
            <JwtPage />
        </div>
    );
};

export default Home;
