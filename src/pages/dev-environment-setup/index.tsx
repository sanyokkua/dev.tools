import {
    DEV_ENV_CATALOG,
    type DevEnvCategory,
    type DevEnvLinuxDistro,
    type DevEnvManagerBootstrap,
    type DevEnvOS,
} from '@/common/dev-env-catalog';
import { usePage } from '@/contexts/PageContext';
import SegmentedControl, { type SegmentedOption } from '@/controls/SegmentedControl';
import ToolAbout from '@/controls/ToolAbout';
import ManagerSetupSteps from '@/page-specific/dev-environment-setup/ManagerSetupSteps';
import React, { useEffect, useMemo, useState } from 'react';
import PageShell from '../../components/layouts/PageShell';

const CATEGORY_OPTIONS: SegmentedOption[] = (Object.keys(DEV_ENV_CATALOG) as DevEnvCategory[]).map((c) => ({
    value: c,
    label: DEV_ENV_CATALOG[c].label,
}));

const OS_OPTIONS: SegmentedOption[] = [
    { value: 'macos', label: 'macOS', icon: '⌘' },
    { value: 'windows', label: 'Windows', icon: '⊞' },
    { value: 'linux', label: 'Linux', icon: '🐧' },
];

const DISTRO_OPTIONS: SegmentedOption[] = [
    { value: 'debian', label: 'Debian / Ubuntu · apt' },
    { value: 'fedora', label: 'Fedora / RHEL · dnf' },
    { value: 'arch', label: 'Arch · pacman' },
    { value: 'suse', label: 'openSUSE · zypper' },
];

const IndexPage = (): React.JSX.Element => {
    const { setPageTitle } = usePage();
    const [category, setCategory] = useState<DevEnvCategory>('java');
    const [os, setOs] = useState<DevEnvOS>('macos');
    const [linuxDistro, setLinuxDistro] = useState<DevEnvLinuxDistro>('debian');
    const [selectedManagerIds, setSelectedManagerIds] = useState<string[]>([]);

    useEffect(() => {
        setPageTitle('Dev Environment Setup');
    }, [setPageTitle]);

    useEffect(() => {
        setOs('macos');
        setLinuxDistro('debian');
    }, [category]);

    useEffect(() => {
        setSelectedManagerIds([]);
    }, [category, os, linuxDistro]);

    const managers = useMemo<DevEnvManagerBootstrap[]>(() => {
        const data = DEV_ENV_CATALOG[category];
        const base = data.managersByOS[os];
        if (os !== 'linux') return base;
        const override = data.linuxDistroOverrides?.[linuxDistro];
        return override ? [...base, ...override] : base;
    }, [category, os, linuxDistro]);

    function toggleManager(id: string): void {
        setSelectedManagerIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
    }

    const selectedEntries = useMemo(
        () => managers.filter((m) => selectedManagerIds.includes(m.managerId)),
        [managers, selectedManagerIds],
    );

    return (
        <PageShell>
            <ToolAbout routeKey="dev-environment-setup">
                A cheat sheet for provisioning a developer workstation. Pick a <strong>category</strong>, an{' '}
                <strong>OS</strong>, and one or more <strong>package/version managers</strong> — get install, configure,
                verify, update, and remove instructions for each, side by side. Nothing here is executed automatically;
                every command is copy or download only.
            </ToolAbout>

            <div className="dev-env-step">
                <div className="dev-env-step__label">
                    <span className="dev-env-step__number">1</span>Category
                </div>
                <SegmentedControl
                    options={CATEGORY_OPTIONS}
                    value={category}
                    onChange={(v) => setCategory(v as DevEnvCategory)}
                    aria-label="Category"
                />
            </div>

            <div className="dev-env-step">
                <div className="dev-env-step__label">
                    <span className="dev-env-step__number">2</span>Operating system
                </div>
                <SegmentedControl
                    options={OS_OPTIONS}
                    value={os}
                    onChange={(v) => setOs(v as DevEnvOS)}
                    aria-label="Operating system"
                />
                {os === 'linux' && (
                    <div className="dev-env-distro-row" data-testid="distro-section">
                        <label className="dev-env-field-label">Linux distribution family</label>
                        <SegmentedControl
                            options={DISTRO_OPTIONS}
                            value={linuxDistro}
                            onChange={(v) => setLinuxDistro(v as DevEnvLinuxDistro)}
                            aria-label="Linux distribution family"
                        />
                    </div>
                )}
            </div>

            <div className="dev-env-step">
                <div className="dev-env-step__label">
                    <span className="dev-env-step__number">3</span>Package / version managers
                </div>
                <p className="dev-env-hint">
                    Select one or more. Managers this category doesn&apos;t support on this OS are simply not shown.
                </p>
                <div
                    className="dev-env-chip-row"
                    data-testid="manager-chips"
                    role="group"
                    aria-label="Package / version managers"
                >
                    {managers.map((m) => (
                        <button
                            key={m.managerId}
                            type="button"
                            className={`chip${selectedManagerIds.includes(m.managerId) ? ' on' : ''}`}
                            aria-pressed={selectedManagerIds.includes(m.managerId)}
                            onClick={() => toggleManager(m.managerId)}
                        >
                            {m.managerLabel}
                        </button>
                    ))}
                </div>
            </div>

            <div className="dev-env-step">
                <div className="dev-env-step__label">
                    <span className="dev-env-step__number">4</span>Instructions
                </div>
                {selectedEntries.length === 0 ? (
                    <p className="dev-env-empty" data-testid="dev-env-empty">
                        Select one or more package managers above to see setup instructions.
                    </p>
                ) : (
                    selectedEntries.map((entry) => (
                        <ManagerSetupSteps key={entry.managerId} entry={entry} os={os} category={category} />
                    ))
                )}
            </div>
        </PageShell>
    );
};

export default IndexPage;
