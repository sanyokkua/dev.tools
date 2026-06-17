'use client';
import { usePage } from '@/contexts/PageContext';
import ToolAbout from '@/controls/ToolAbout';
import React, { useEffect } from 'react';
import CronPage from './CronPage';

const Home: React.FC = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Cron');
    }, [setPageTitle]);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <ToolAbout routeKey="cron" title="Cron Editor / Tester">
                Parse and test cron expressions — get a human-readable description and the next N run times. Supports
                Linux 5-field, Quartz 6-field, and AWS EventBridge formats. All computation runs locally.
            </ToolAbout>
            <CronPage />
        </div>
    );
};

export default Home;
