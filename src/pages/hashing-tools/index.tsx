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
            <ToolAbout routeKey="hashing-tools">
                Compute cryptographic digests of text or a file — <strong>MD5, SHA-1, SHA-256, SHA-384, SHA-512</strong>{' '}
                — all at once in a results table with one-click copy and an uppercase-hex toggle. SHA family uses the
                browser's WebCrypto; MD5 uses a bundled library. Drag a file in or paste text; large files are hashed
                from their bytes. Fully offline.
            </ToolAbout>
            <HashingPage />
        </div>
    );
};

export default Home;
