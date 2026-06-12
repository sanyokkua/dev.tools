// src/pages/software-installer/index.tsx
import { APPS_CATALOG } from '@/common/apps-catalog';
import type { CatalogManager, CatalogPlatform, LinuxDistro } from '@/common/apps-catalog-types';
import { usePage } from '@/contexts/PageContext';
import SegmentedControl, { type SegmentedOption } from '@/controls/SegmentedControl';
import React, { useEffect, useMemo, useState } from 'react';

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

type PrefMode = 'preferred' | 'fallback';

const PREF_OPTIONS: SegmentedOption[] = [
    { value: 'preferred', label: 'Preferred only (skip)' },
    { value: 'fallback', label: 'Fall back to any available' },
];

const MANAGER_LABEL: Partial<Record<CatalogManager, string>> = {
    brew: 'Homebrew',
    mas: 'Mac App Store',
    winget: 'winget',
    choco: 'Chocolatey',
    scoop: 'Scoop',
    apt: 'apt',
    dnf: 'dnf',
    pacman: 'pacman',
    zypper: 'zypper',
    flatpak: 'Flatpak',
    snap: 'Snap',
    appimage: 'AppImage',
    npm: 'npm',
    uv: 'uv',
    pipx: 'pipx',
    cargo: 'cargo',
    go: 'go',
};

const IndexPage = (): React.JSX.Element => {
    const { setPageTitle } = usePage();
    const [platform, setPlatform] = useState<CatalogPlatform>('macos');
    const [linuxDistro, setLinuxDistro] = useState<LinuxDistro>('debian');
    const [selectedManagers, setSelectedManagers] = useState<CatalogManager[]>([]);
    const [prefMode, setPrefMode] = useState<PrefMode>('preferred');

    useEffect(() => {
        setPageTitle('Software Installer');
    }, [setPageTitle]);

    useEffect(() => {
        setSelectedManagers([]);
    }, [platform, linuxDistro]);

    const platformManagers = useMemo<CatalogManager[]>(() => {
        if (platform === 'linux') return APPS_CATALOG.managers.linux[linuxDistro] ?? [];
        return APPS_CATALOG.managers[platform as 'macos' | 'windows'] ?? [];
    }, [platform, linuxDistro]);

    function toggleManager(mgr: CatalogManager): void {
        setSelectedManagers((prev) => (prev.includes(mgr) ? prev.filter((m) => m !== mgr) : [...prev, mgr]));
    }

    return (
        <div className="installer-page">
            {/* Sticky summary */}
            <section className="installer-summary" aria-label="Selection summary">
                <span className="installer-summary__pill" data-testid="sum-platform">
                    {PLATFORM_LABEL[platform]}
                </span>
                <span className="installer-summary__pill" data-testid="sum-managers">
                    {selectedManagers.length} {selectedManagers.length === 1 ? 'manager' : 'managers'}
                </span>
                <span className="installer-summary__pill" data-testid="sum-apps">
                    0 apps
                </span>
                <span className="installer-summary__pref" data-testid="sum-pref">
                    {prefMode === 'preferred' ? 'preferred-only' : 'fallback on'}
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
                <p className="installer-hint">
                    Pick one or more. Selection <strong>order = priority</strong> when an app supports several.
                </p>
                <div
                    className="installer-chip-row"
                    data-testid="mgr-chips"
                    role="group"
                    aria-label="Platform package managers"
                >
                    {platformManagers.map((mgr) => (
                        <button
                            key={mgr}
                            type="button"
                            className={`chip${selectedManagers.includes(mgr) ? ' on' : ''}`}
                            aria-pressed={selectedManagers.includes(mgr)}
                            onClick={() => toggleManager(mgr)}
                        >
                            {MANAGER_LABEL[mgr] ?? mgr}
                        </button>
                    ))}
                </div>
                <span className="installer-mgr-subheading">Language / dev managers</span>
                <div
                    className="installer-chip-row"
                    data-testid="dev-chips"
                    role="group"
                    aria-label="Dev package managers"
                >
                    {APPS_CATALOG.managers.dev.map((mgr) => (
                        <button
                            key={mgr}
                            type="button"
                            className={`chip${selectedManagers.includes(mgr) ? ' on' : ''}`}
                            aria-pressed={selectedManagers.includes(mgr)}
                            onClick={() => toggleManager(mgr)}
                        >
                            {MANAGER_LABEL[mgr] ?? mgr}
                        </button>
                    ))}
                </div>
                <div className="installer-divider" />
                <div className="installer-pref-row">
                    <span className="installer-mgr-subheading">
                        When an app isn&apos;t available via a preferred manager
                    </span>
                    <SegmentedControl
                        options={PREF_OPTIONS}
                        value={prefMode}
                        onChange={(v) => setPrefMode(v as PrefMode)}
                        aria-label="Fallback preference"
                    />
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
