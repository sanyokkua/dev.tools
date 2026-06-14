import { LinuxDistro } from '@/common/linux-utils';
import { usePage } from '@/contexts/PageContext';
import SegmentedControl, { SegmentedOption } from '@/controls/SegmentedControl';
import EnvironmentVariablesSection from '@/page-specific/linux-setup/EnvironmentVariablesSection';
import PackageManagersSection from '@/page-specific/linux-setup/PackageManagersSection';
import React, { useEffect, useState } from 'react';
import PageShell from '../../components/layouts/PageShell';

type LinuxTab = 'managers' | 'env-vars';

const TABS: SegmentedOption[] = [
    { value: 'managers', label: 'Package managers' },
    { value: 'env-vars', label: 'Environment variables' },
];

const DISTROS: SegmentedOption[] = [
    { value: 'debian', label: 'Debian / Ubuntu' },
    { value: 'fedora', label: 'Fedora / RHEL' },
    { value: 'arch', label: 'Arch' },
    { value: 'suse', label: 'openSUSE' },
];

const IndexPage = (): React.JSX.Element => {
    const { setPageTitle } = usePage();
    const [activeTab, setActiveTab] = useState<LinuxTab>('managers');
    const [selectedDistro, setSelectedDistro] = useState<LinuxDistro>('debian');

    useEffect(() => {
        setPageTitle('Linux Setup');
    }, [setPageTitle]);

    return (
        <PageShell>
            <section>
                <h1>Linux Setup</h1>
                <p>
                    Install package managers and configure environment variables. App installation lives in{' '}
                    <a href="/software-installer">Software Installer</a>.
                </p>

                <SegmentedControl
                    options={DISTROS}
                    value={selectedDistro}
                    onChange={(v) => setSelectedDistro(v as LinuxDistro)}
                    aria-label="Distro family"
                />

                <div style={{ marginTop: 12 }}>
                    <SegmentedControl
                        options={TABS}
                        value={activeTab}
                        onChange={(v) => setActiveTab(v as LinuxTab)}
                        aria-label="Linux Setup sections"
                    />
                </div>

                <div style={{ marginTop: 20 }}>
                    {activeTab === 'managers' && <PackageManagersSection distro={selectedDistro} />}
                    {activeTab === 'env-vars' && <EnvironmentVariablesSection />}
                </div>
            </section>
        </PageShell>
    );
};

export default IndexPage;
