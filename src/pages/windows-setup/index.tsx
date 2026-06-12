import { usePage } from '@/contexts/PageContext';
import ContentContainerFlex from '@/layouts/ContentContainerFlex';
import EnvironmentVariablesSection from '@/page-specific/windows-setup/EnvironmentVariablesSection';
import PackageManagersSection from '@/page-specific/windows-setup/PackageManagersSection';
import React, { useEffect, useState } from 'react';

type WindowsTab = 'managers' | 'env-vars';

const TABS: { value: WindowsTab; label: string }[] = [
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
        <ContentContainerFlex>
            <section>
                <h1>Windows Setup</h1>
                <p>
                    Install package managers and configure environment variables. App installation lives in{' '}
                    <a href="/software-installer">Software Installer</a>.
                </p>

                <div className="windows-setup-tabs" role="tablist">
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

                {activeTab === 'managers' && <PackageManagersSection />}
                {activeTab === 'env-vars' && <EnvironmentVariablesSection />}
            </section>
        </ContentContainerFlex>
    );
};

export default IndexPage;
