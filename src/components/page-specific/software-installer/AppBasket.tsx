import { APPS_CATALOG } from '@/common/apps-catalog';
import type { CatalogApp, CatalogManager, CatalogPlatform, LinuxDistro } from '@/common/apps-catalog-types';
import { MANAGER_LABEL, getAvailableManagers } from '@/common/catalog-utils';
import type { BuilderConfig } from '@/common/script-builder';
import { resolveManager } from '@/common/script-builder';
import React, { useMemo } from 'react';

type PrefMode = 'preferred' | 'fallback';

interface AppBasketProps {
    platform: CatalogPlatform;
    linuxDistro: LinuxDistro;
    selectedManagers: CatalogManager[];
    prefMode: PrefMode;
    selectedApps: Record<string, CatalogManager | null>;
    selectedVersions: Record<string, string>;
    onRemove: (appId: string) => void;
    onOverride: (appId: string, mgr: CatalogManager | null) => void;
    onVersionSelect: (appId: string, version: string) => void;
    onClear: () => void;
}

type BasketStatus =
    | { kind: 'ok'; manager: CatalogManager }
    | { kind: 'fallback'; manager: CatalogManager }
    | { kind: 'skip' }
    | { kind: 'no-version' }
    | { kind: 'error' };

function getStatus(app: CatalogApp, config: BuilderConfig, selectedManagers: CatalogManager[]): BasketStatus {
    if (!app.platforms[config.platform]) return { kind: 'error' };
    if (app.parameterized && !config.selectedVersions[app.id]) return { kind: 'no-version' };
    const mgr = resolveManager(app, config);
    if (!mgr) return { kind: 'skip' };
    const isFallback = selectedManagers.length > 0 && !selectedManagers.includes(mgr);
    return isFallback ? { kind: 'fallback', manager: mgr } : { kind: 'ok', manager: mgr };
}

function statusLabel(s: BasketStatus): string {
    if (s.kind === 'ok') return `Via ${MANAGER_LABEL[s.manager] ?? s.manager}`;
    if (s.kind === 'fallback') return `Fallback: ${MANAGER_LABEL[s.manager] ?? s.manager}`;
    if (s.kind === 'skip') return 'No preferred manager — skipped';
    if (s.kind === 'no-version') return 'Select a version';
    return 'Not available on this platform';
}

const AppBasket = ({
    platform,
    linuxDistro,
    selectedManagers,
    prefMode,
    selectedApps,
    selectedVersions,
    onRemove,
    onOverride,
    onVersionSelect,
    onClear,
}: AppBasketProps): React.JSX.Element => {
    const config: BuilderConfig = useMemo(
        () => ({
            platform,
            linuxDistro: platform === 'linux' ? linuxDistro : undefined,
            managers: selectedManagers,
            overrides: Object.fromEntries(
                Object.entries(selectedApps).filter(([, mgr]) => mgr !== null) as [string, CatalogManager][],
            ),
            fallbackMode: prefMode === 'preferred' ? 'preferred-only' : 'fallback',
            selectedVersions,
        }),
        [platform, linuxDistro, selectedManagers, prefMode, selectedApps, selectedVersions],
    );

    const selectedList = useMemo(() => APPS_CATALOG.apps.filter((a) => a.id in selectedApps), [selectedApps]);

    const count = selectedList.length;

    return (
        <div data-testid="app-basket">
            <div className="installer-basket-header">
                <span>
                    Selected{' '}
                    <span className="installer-basket-count" data-testid="basket-count">
                        ({count})
                    </span>
                </span>
                {count > 0 && (
                    <button type="button" className="btn ghost sm" onClick={onClear}>
                        Clear
                    </button>
                )}
            </div>

            {count === 0 ? (
                <p className="installer-basket-empty" data-testid="basket-empty">
                    No apps selected yet — pick from the catalog. Each selected app lets you{' '}
                    <strong>change its install method</strong>.
                </p>
            ) : (
                <div className="installer-basket-list">
                    {selectedList.map((app) => {
                        const available = getAvailableManagers(app, platform, linuxDistro);
                        const preferred = available.filter((m) => selectedManagers.includes(m));
                        const fallback = available.filter((m) => !selectedManagers.includes(m));
                        const override = selectedApps[app.id];
                        const status = getStatus(app, config, selectedManagers);

                        return (
                            <div key={app.id} className="installer-basket-card">
                                <div className="installer-basket-card__top">
                                    <div className="installer-basket-card__info">
                                        <span className="installer-basket-card__name">{app.name}</span>
                                        <span className="installer-basket-card__cat">{app.category}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn ghost sm"
                                        onClick={() => onRemove(app.id)}
                                        aria-label={`Remove ${app.name}`}
                                    >
                                        ×
                                    </button>
                                </div>

                                <span
                                    className={`installer-basket-status ${status.kind === 'no-version' ? 'skip' : status.kind}`}
                                >
                                    {statusLabel(status)}
                                </span>

                                {available.length > 0 && (
                                    <div className="installer-basket-card__field">
                                        <label htmlFor={`override-${app.id}`}>Method</label>
                                        <select
                                            id={`override-${app.id}`}
                                            value={override ?? ''}
                                            onChange={(e) =>
                                                onOverride(app.id, (e.target.value as CatalogManager) || null)
                                            }
                                            aria-label={`Install method for ${app.name}`}
                                        >
                                            <option value="">Auto</option>
                                            {preferred.map((m) => (
                                                <option key={m} value={m}>
                                                    {MANAGER_LABEL[m] ?? m}
                                                </option>
                                            ))}
                                            {fallback.map((m) => (
                                                <option key={m} value={m}>
                                                    {MANAGER_LABEL[m] ?? m} (fallback)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {app.parameterized && app.versions && (
                                    <div className="installer-basket-card__field">
                                        <label htmlFor={`version-${app.id}`}>Version</label>
                                        <select
                                            id={`version-${app.id}`}
                                            value={selectedVersions[app.id] ?? ''}
                                            onChange={(e) => onVersionSelect(app.id, e.target.value)}
                                            aria-label={`Version for ${app.name}`}
                                        >
                                            <option value="">— select —</option>
                                            {app.versions.map((v) => (
                                                <option key={v} value={v}>
                                                    {v}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AppBasket;
