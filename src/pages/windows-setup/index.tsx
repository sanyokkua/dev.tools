import { usePage } from '@/contexts/PageContext';
import SegmentedControl, { SegmentedOption } from '@/controls/SegmentedControl';
import ToolAbout from '@/controls/ToolAbout';
import EnvironmentVariablesSection from '@/page-specific/windows-setup/EnvironmentVariablesSection';
import PackageManagersSection from '@/page-specific/windows-setup/PackageManagersSection';
import React, { useEffect, useState } from 'react';
import PageShell from '../../components/layouts/PageShell';

type WindowsTab = 'managers' | 'env-vars';

const TABS: SegmentedOption[] = [
    { value: 'managers', label: 'Package managers' },
    { value: 'env-vars', label: 'Environment variables' },
];

const IndexPage = (): React.JSX.Element => {
    const { setPageTitle } = usePage();
    const [activeTab, setActiveTab] = useState<WindowsTab>('managers');

    useEffect(() => {
        setPageTitle('Windows Setup');
    }, [setPageTitle]);

    return (
        <PageShell>
            <ToolAbout routeKey="windows-setup">
                Set up Windows package managers — <strong>winget</strong>, <strong>Chocolatey</strong>,{' '}
                <strong>Scoop</strong> — and configure environment variables. Copy the PowerShell commands for the
                manager you prefer. App installation lives in the Software Installer.
            </ToolAbout>
            <section>
                <SegmentedControl
                    options={TABS}
                    value={activeTab}
                    onChange={(v) => setActiveTab(v as WindowsTab)}
                    aria-label="Windows Setup sections"
                />

                <div style={{ marginTop: 20 }}>
                    {activeTab === 'managers' && <PackageManagersSection />}
                    {activeTab === 'env-vars' && <EnvironmentVariablesSection />}
                </div>
            </section>
        </PageShell>
    );
};

export default IndexPage;
