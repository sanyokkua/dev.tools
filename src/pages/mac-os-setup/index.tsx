import { usePage } from '@/contexts/PageContext';
import ContentContainerFlex from '@/layouts/ContentContainerFlex';
import BrewInstallSteps from '@/page-specific/mac-os-setup/BrewInstallSteps';
import EnvironmentVariablesSection from '@/page-specific/mac-os-setup/EnvironmentVariablesSection';
import VramManager from '@/page-specific/mac-os-setup/VramManager';
import React, { useEffect, useState } from 'react';

type MacOsTab = 'managers' | 'env-vars' | 'scripts';

const TABS: { value: MacOsTab; label: string }[] = [
    { value: 'managers', label: 'Package managers' },
    { value: 'env-vars', label: 'Environment variables' },
    { value: 'scripts', label: 'Platform scripts' },
];

const IndexPage = (): React.JSX.Element => {
    const { setPageTitle } = usePage();
    const [activeTab, setActiveTab] = useState<MacOsTab>('managers');

    useEffect(() => {
        setPageTitle('macOS Setup');
    }, [setPageTitle]);

    return (
        <ContentContainerFlex>
            <section>
                <h1>macOS Setup</h1>
                <p>
                    Install package managers, configure environment variables, and run platform-specific scripts. App
                    installation lives in <a href="/software-installer">Software Installer</a>.
                </p>

                <div className="mac-os-tabs" role="tablist">
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

                {activeTab === 'managers' && <BrewInstallSteps />}
                {activeTab === 'env-vars' && <EnvironmentVariablesSection />}
                {activeTab === 'scripts' && (
                    <div>
                        <div className="mac-os-script-header">
                            <strong>Apple Silicon VRAM Manager</strong>
                            <span className="pill">platform-specific</span>
                        </div>
                        <p>
                            Raises the unified-memory (<code>iogpu.wired_limit_mb</code>) limit so larger local LLMs
                            fit. Apple Silicon only. Pairs with the{' '}
                            <a href="/llm-vram-calculator">LLM VRAM Calculator</a>.
                        </p>
                        <VramManager />
                        <p style={{ marginTop: 16, fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
                            Future platform-specific scripts can be added here as additional cards.
                        </p>
                    </div>
                )}
            </section>
        </ContentContainerFlex>
    );
};

export default IndexPage;
