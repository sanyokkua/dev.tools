import { usePage } from '@/contexts/PageContext';
import SegmentedControl, { SegmentedOption } from '@/controls/SegmentedControl';
import ToolAbout from '@/controls/ToolAbout';
import EnvironmentVariablesSection from '@/page-specific/windows-setup/EnvironmentVariablesSection';
import PackageManagersSection from '@/page-specific/windows-setup/PackageManagersSection';
import Link from 'next/link';
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
            <ToolAbout routeKey="windows-setup" title="Windows Setup">
                Step-by-step guide to setting up a Windows development environment.
            </ToolAbout>
            <section>
                <h1>Windows Setup</h1>
                <p>
                    Install package managers and configure environment variables. App installation lives in{' '}
                    <Link href="/software-installer">Software Installer</Link>.
                </p>

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
