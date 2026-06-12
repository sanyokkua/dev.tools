import { LinuxDistro } from '@/common/linux-utils';
import { usePage } from '@/contexts/PageContext';
import ContentContainerFlex from '@/layouts/ContentContainerFlex';
import EnvironmentVariablesSection from '@/page-specific/linux-setup/EnvironmentVariablesSection';
import PackageManagersSection from '@/page-specific/linux-setup/PackageManagersSection';
import React, { useEffect, useState } from 'react';

type LinuxTab = 'managers' | 'env-vars';

const TABS: { value: LinuxTab; label: string }[] = [
    { value: 'managers', label: 'Package managers' },
    { value: 'env-vars', label: 'Environment variables' },
];

const DISTROS: { value: LinuxDistro; label: string }[] = [
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
        <ContentContainerFlex>
            <section>
                <h1>Linux Setup</h1>
                <p>
                    Install package managers and configure environment variables. App installation lives in{' '}
                    <a href="/software-installer">Software Installer</a>.
                </p>

                <div className="linux-setup-distro" role="group" aria-label="Distro family">
                    {DISTROS.map((d) => (
                        <button
                            key={d.value}
                            type="button"
                            className={selectedDistro === d.value ? 'active' : ''}
                            onClick={() => setSelectedDistro(d.value)}
                            aria-pressed={selectedDistro === d.value}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>

                <div className="linux-setup-tabs" role="tablist">
                    {TABS.map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            className={activeTab === tab.value ? 'active' : ''}
                            onClick={() => setActiveTab(tab.value)}
                            aria-pressed={activeTab === tab.value}
                            role="tab"
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'managers' && <PackageManagersSection distro={selectedDistro} />}
                {activeTab === 'env-vars' && <EnvironmentVariablesSection />}
            </section>
        </ContentContainerFlex>
    );
};

export default IndexPage;
