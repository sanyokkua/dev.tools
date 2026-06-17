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
            <ToolAbout routeKey="cron">
                Parse and test cron expressions — get a human-readable description and the next scheduled run times.
                Supports <strong>Linux 5-field</strong> (minute hour day month weekday), <strong>Quartz 6-field</strong>{' '}
                (adds seconds), and <strong>AWS EventBridge</strong> formats. Enter any expression to see it explained
                in plain English plus a list of upcoming runs. All computation runs locally.
            </ToolAbout>
            <CronPage />
        </div>
    );
};

export default Home;
