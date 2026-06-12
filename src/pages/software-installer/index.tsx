// src/pages/software-installer/index.tsx
import type { CatalogPlatform, LinuxDistro } from '@/common/apps-catalog-types';
import { usePage } from '@/contexts/PageContext';
import SegmentedControl, { type SegmentedOption } from '@/controls/SegmentedControl';
import React, { useEffect, useState } from 'react';

const PLATFORM_OPTIONS: SegmentedOption[] = [
    { value: 'macos', label: 'macOS' },
    { value: 'windows', label: 'Windows' },
    { value: 'linux', label: 'Linux' },
];

const DISTRO_OPTIONS: SegmentedOption[] = [
    { value: 'debian', label: 'Debian / Ubuntu · apt' },
    { value: 'fedora', label: 'Fedora / RHEL · dnf' },
    { value: 'arch', label: 'Arch · pacman' },
    { value: 'suse', label: 'openSUSE · zypper' },
    { value: 'universal', label: 'Universal' },
];

const PLATFORM_LABEL: Record<CatalogPlatform, string> = { macos: 'macOS', windows: 'Windows', linux: 'Linux' };

const IndexPage = (): React.JSX.Element => {
    const { setPageTitle } = usePage();
    const [platform, setPlatform] = useState<CatalogPlatform>('macos');
    const [linuxDistro, setLinuxDistro] = useState<LinuxDistro>('debian');

    useEffect(() => {
        setPageTitle('Software Installer');
    }, [setPageTitle]);

    return (
        <div className="installer-page">
            {/* Sticky summary — manager/app counts wired in Tasks 3.2/3.3 */}
            <section className="installer-summary" aria-label="Selection summary">
                <span className="installer-summary__pill" data-testid="sum-platform">
                    {PLATFORM_LABEL[platform]}
                </span>
                <span className="installer-summary__pill" data-testid="sum-managers">
                    0 managers
                </span>
                <span className="installer-summary__pill" data-testid="sum-apps">
                    0 apps
                </span>
                <span className="installer-summary__pref" data-testid="sum-pref">
                    preferred-only
                </span>
                <button className="btn primary" style={{ marginLeft: 'auto' }} disabled>
                    ⚙ Build Scripts
                </button>
            </section>

            {/* Step 1 — Target platform */}
            <div className="installer-step">
                <div className="installer-step__label">
                    <span className="installer-step__number">1</span>
                    Target platform
                </div>
                <SegmentedControl
                    options={PLATFORM_OPTIONS}
                    value={platform}
                    onChange={(v) => setPlatform(v as CatalogPlatform)}
                    aria-label="Target platform"
                />
                {platform === 'linux' && (
                    <div className="installer-distro-row" data-testid="distro-section">
                        <label className="installer-field-label">Linux distribution family</label>
                        <SegmentedControl
                            options={DISTRO_OPTIONS}
                            value={linuxDistro}
                            onChange={(v) => setLinuxDistro(v as LinuxDistro)}
                            aria-label="Linux distribution family"
                        />
                    </div>
                )}
            </div>

            {/* Step 2 — Preferred package managers (Task 3.2) */}
            <div className="installer-step">
                <div className="installer-step__label">
                    <span className="installer-step__number">2</span>
                    Preferred package managers
                </div>
            </div>

            {/* Step 3 — Applications (Task 3.3) */}
            <div className="installer-step">
                <div className="installer-step__label">
                    <span className="installer-step__number">3</span>
                    Applications
                </div>
            </div>

            {/* Step 4 — Output (Task 3.4) */}
            <div className="installer-step">
                <div className="installer-step__label">
                    <span className="installer-step__number">4</span>
                    Output
                </div>
            </div>
        </div>
    );
};

export default IndexPage;
