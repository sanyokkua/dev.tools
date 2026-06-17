import { usePage } from '@/contexts/PageContext';
import SegmentedControl, { SegmentedOption } from '@/controls/SegmentedControl';
import ToolAbout from '@/controls/ToolAbout';
import BrewInstallSteps from '@/page-specific/mac-os-setup/BrewInstallSteps';
import EnvironmentVariablesSection from '@/page-specific/mac-os-setup/EnvironmentVariablesSection';
import VramManager from '@/page-specific/mac-os-setup/VramManager';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import PageShell from '../../components/layouts/PageShell';

type MacOsTab = 'managers' | 'env-vars' | 'scripts';

const TABS: SegmentedOption[] = [
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
        <PageShell>
            <ToolAbout routeKey="mac-os-setup">
                Get a Mac ready for development: install <strong>Homebrew</strong>, configure your shell{' '}
                <code>PATH</code>/profile, and run platform-specific scripts (including the{' '}
                <strong>Apple Silicon VRAM Manager</strong> for local LLMs). App installation lives in the Software
                Installer. Each step is a copyable command.
            </ToolAbout>
            <section>
                <h1>macOS Setup</h1>

                <SegmentedControl
                    options={TABS}
                    value={activeTab}
                    onChange={(v) => setActiveTab(v as MacOsTab)}
                    aria-label="macOS Setup sections"
                />

                <div style={{ marginTop: 20 }}>
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
                                <Link href="/llm-vram-calculator">LLM VRAM Calculator</Link>.
                            </p>
                            <VramManager />
                            <p style={{ marginTop: 16, fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
                                Future platform-specific scripts can be added here as additional cards.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </PageShell>
    );
};

export default IndexPage;
