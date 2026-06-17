'use client';
import { usePage } from '@/contexts/PageContext';
import ToolAbout from '@/controls/ToolAbout';
import React, { useEffect } from 'react';
import QrPage from './QrPage';

const Home: React.FC = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('QR');
    }, [setPageTitle]);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <ToolAbout routeKey="qr">
                Generate QR codes for{' '}
                <strong>
                    URLs, plain text, Wi-Fi credentials, contacts (vCard), calendar events, email, phone, SMS,
                </strong>{' '}
                or <strong>coordinates</strong>. Pick an error-correction level (L/M/Q/H) and download a high-resolution
                PNG (1024×1024 px) or a scalable SVG. Everything runs locally — no data leaves your browser.
            </ToolAbout>
            <QrPage />
        </div>
    );
};
export default Home;
