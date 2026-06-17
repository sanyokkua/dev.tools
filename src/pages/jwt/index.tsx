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
            <ToolAbout routeKey="jwt">
                Decode, verify, and sign JSON Web Tokens. <strong>Decode</strong> mode displays the header, payload, and
                signature of any JWT without a secret. <strong>Verify</strong> mode checks the signature with a
                HS256/RS256 secret or public key. <strong>Sign</strong> mode builds a new token from a JSON payload and
                a secret. All operations run locally — secrets and tokens never leave your browser.
            </ToolAbout>
            <JwtPage />
        </div>
    );
};

export default Home;
