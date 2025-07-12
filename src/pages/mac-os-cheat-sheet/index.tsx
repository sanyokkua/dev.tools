'use client';
import { usePage } from '@/contexts/PageContext';
import BrewInstallApplications from '@/page-specific/mac-os-cheat-sheet/BrewInstallApplications';
import BrewInstallSteps from '@/page-specific/mac-os-cheat-sheet/BrewInstallSteps';
import { useEffect } from 'react';

const IndexPage = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('MacOS Cheat Sheet');
    }, [setPageTitle]);

    return (
        <div>
            <h1>Homebrew Installation & Setup Guide</h1>
            <BrewInstallSteps />
            <BrewInstallApplications />
        </div>
    );
};

export default IndexPage;
