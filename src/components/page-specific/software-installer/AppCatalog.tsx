import { APPS_CATALOG } from '@/common/apps-catalog';
import type { CatalogApp, CatalogManager, CatalogPlatform, LinuxDistro } from '@/common/apps-catalog-types';
import { filterCatalog, getAvailableManagers, getCategories } from '@/common/catalog-utils';
import React, { useCallback, useMemo, useState } from 'react';

interface AppCatalogProps {
    platform: CatalogPlatform;
    selectedAppIds: ReadonlySet<string>;
    onToggle: (app: CatalogApp) => void;
    selectedManagers: CatalogManager[];
    linuxDistro: LinuxDistro;
    onBulkAdd: (apps: CatalogApp[]) => void;
}

const ALL_PLATFORMS: CatalogPlatform[] = ['macos', 'windows', 'linux'];
const PLATFORM_TITLE: Record<CatalogPlatform, string> = { macos: 'macOS', windows: 'Windows', linux: 'Linux' };

const AppCatalog = ({
    platform,
    selectedAppIds,
    onToggle,
    selectedManagers,
    linuxDistro,
    onBulkAdd,
}: AppCatalogProps): React.JSX.Element => {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const categories = useMemo(() => getCategories(APPS_CATALOG.apps), []);

    const filtered = useMemo(() => filterCatalog(APPS_CATALOG.apps, search, activeCategory), [search, activeCategory]);

    const handleAddAllVisible = useCallback(() => {
        const toAdd = filtered.filter((app) => app.platforms[platform] && !selectedAppIds.has(app.id));
        onBulkAdd(toAdd);
    }, [filtered, platform, selectedAppIds, onBulkAdd]);

    const handleAddSupported = useCallback(() => {
        const toAdd = filtered.filter(
            (app) =>
                !selectedAppIds.has(app.id) &&
                getAvailableManagers(app, platform, linuxDistro).some((m) => selectedManagers.includes(m)),
        );
        onBulkAdd(toAdd);
    }, [filtered, platform, selectedAppIds, linuxDistro, selectedManagers, onBulkAdd]);

    return (
        <div data-testid="app-catalog">
            <div className="installer-search-bar">
                <span aria-hidden="true">🔎</span>
                <input
                    id="app-search"
                    placeholder="Search apps…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search apps"
                />
            </div>

            <div
                className="installer-chip-row"
                style={{ marginBottom: 'var(--s2)' }}
                role="group"
                aria-label="Category filter"
            >
                <button
                    type="button"
                    className={`chip${activeCategory === null ? ' on' : ''}`}
                    aria-pressed={activeCategory === null}
                    onClick={() => setActiveCategory(null)}
                >
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        className={`chip${activeCategory === cat ? ' on' : ''}`}
                        aria-pressed={activeCategory === cat}
                        onClick={() => setActiveCategory((prev) => (prev === cat ? null : cat))}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="installer-bulk-row">
                <button type="button" className="btn ghost" onClick={handleAddAllVisible}>
                    Add All Visible
                </button>
                <button type="button" className="btn ghost" onClick={handleAddSupported}>
                    Add Supported
                </button>
            </div>

            <div className="installer-catalog-scroll">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: 34 }} />
                            <th>App</th>
                            <th>Category</th>
                            <th>Availability</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((app) => (
                            <tr
                                key={app.id}
                                onClick={() => {
                                    if (!app.platforms[platform]) return;
                                    onToggle(app);
                                }}
                                style={{ cursor: app.platforms[platform] ? 'pointer' : 'not-allowed' }}
                                className={!app.platforms[platform] ? 'installer-catalog-row--unavailable' : ''}
                            >
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedAppIds.has(app.id)}
                                        onChange={() => {
                                            if (!app.platforms[platform]) return;
                                            onToggle(app);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        disabled={!app.platforms[platform]}
                                        aria-label={`Select ${app.name}`}
                                        data-testid={`select-app-${app.id}`}
                                    />
                                </td>
                                <td>
                                    <span title={app.description}>{app.name}</span>
                                    {app.site && (
                                        <a
                                            href={app.site}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="app-site-link"
                                            title="Visit official site"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            ↗
                                        </a>
                                    )}
                                </td>
                                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{app.category}</td>
                                <td>
                                    <div className="installer-avail">
                                        {ALL_PLATFORMS.map((p) => (
                                            <span
                                                key={p}
                                                className={`installer-avail__pill${app.platforms[p] ? ' ok' : ' no'}`}
                                                title={`${PLATFORM_TITLE[p]}: ${app.platforms[p] ? 'available' : 'unavailable'}`}
                                            >
                                                {p === 'macos' ? 'mac' : p === 'windows' ? 'win' : 'linux'}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AppCatalog;
