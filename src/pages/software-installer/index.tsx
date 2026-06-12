// src/pages/software-installer/index.tsx
import { APPS_CATALOG } from '@/common/apps-catalog';
import type { CatalogApp, CatalogManager, CatalogPlatform, LinuxDistro } from '@/common/apps-catalog-types';
import { MANAGER_LABEL } from '@/common/catalog-utils';
import { usePage } from '@/contexts/PageContext';
import SegmentedControl, { type SegmentedOption } from '@/controls/SegmentedControl';
import AppBasket from '@/page-specific/software-installer/AppBasket';
import AppCatalog from '@/page-specific/software-installer/AppCatalog';
import ScriptOutput from '@/page-specific/software-installer/ScriptOutput';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

const IndexPage = (): React.JSX.Element => {
    const { setPageTitle } = usePage();
    const [platform, setPlatform] = useState<CatalogPlatform>('macos');
    const [linuxDistro, setLinuxDistro] = useState<LinuxDistro>('debian');
    const [selectedManagers, setSelectedManagers] = useState<CatalogManager[]>([]);
    const [prefMode, setPrefMode] = useState<PrefMode>('preferred');
    const [selectedApps, setSelectedApps] = useState<Record<string, CatalogManager | null>>({});
    const [selectedVersions, setSelectedVersions] = useState<Record<string, string>>({});

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

    const toggleApp = useCallback((app: CatalogApp): void => {
        setSelectedApps((prev) => {
            if (app.id in prev) {
                const next = { ...prev };
                delete next[app.id];
                return next;
            }
            return { ...prev, [app.id]: null };
        });
    }, []);

    const removeApp = useCallback((appId: string): void => {
        setSelectedApps((prev) => {
            const next = { ...prev };
            delete next[appId];
            return next;
        });
    }, []);

    const setOverride = useCallback((appId: string, mgr: CatalogManager | null): void => {
        setSelectedApps((prev) => ({ ...prev, [appId]: mgr }));
    }, []);

    const setVersion = useCallback((appId: string, version: string): void => {
        setSelectedVersions((prev) => ({ ...prev, [appId]: version }));
    }, []);

    const clearBasket = useCallback((): void => {
        setSelectedApps({});
        setSelectedVersions({});
    }, []);

    const selectedAppCount = useMemo(() => Object.keys(selectedApps).length, [selectedApps]);
    const selectedAppIds = useMemo(() => new Set(Object.keys(selectedApps)), [selectedApps]);
    const outputRef = useRef<HTMLDivElement>(null);

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
                    {selectedAppCount} {selectedAppCount === 1 ? 'app' : 'apps'}
                </span>
                <span className="installer-summary__pref" data-testid="sum-pref">
                    {prefMode === 'preferred' ? 'preferred-only' : 'fallback on'}
                </span>
                <button
                    className="btn primary"
                    style={{ marginLeft: 'auto' }}
                    disabled={selectedAppCount === 0}
                    onClick={() => outputRef.current?.scrollIntoView({ behavior: 'smooth' })}
                >
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

            {/* Step 3 — Applications */}
            <div className="installer-step">
                <div className="installer-step__label">
                    <span className="installer-step__number">3</span>
                    Applications
                </div>
                <div className="installer-apps-grid">
                    <AppCatalog platform={platform} selectedAppIds={selectedAppIds} onToggle={toggleApp} />
                    <AppBasket
                        platform={platform}
                        linuxDistro={linuxDistro}
                        selectedManagers={selectedManagers}
                        prefMode={prefMode}
                        selectedApps={selectedApps}
                        selectedVersions={selectedVersions}
                        onRemove={removeApp}
                        onOverride={setOverride}
                        onVersionSelect={setVersion}
                        onClear={clearBasket}
                    />
                </div>
            </div>

            {/* Step 4 — Output (Task 3.4) */}
            <div className="installer-step" ref={outputRef}>
                <div className="installer-step__label">
                    <span className="installer-step__number">4</span>
                    Output
                </div>
                <ScriptOutput
                    platform={platform}
                    linuxDistro={linuxDistro}
                    selectedManagers={selectedManagers}
                    prefMode={prefMode}
                    selectedApps={selectedApps}
                    selectedVersions={selectedVersions}
                />
            </div>
        </div>
    );
};

export default IndexPage;
