import { APPS_CATALOG } from '@/common/apps-catalog';
import type { CatalogApp, CatalogPlatform } from '@/common/apps-catalog-types';
import { filterCatalog, getCategories } from '@/common/catalog-utils';
import React, { useMemo, useState } from 'react';

interface AppCatalogProps {
    platform: CatalogPlatform;
    selectedAppIds: ReadonlySet<string>;
    onToggle: (app: CatalogApp) => void;
}

const PLATFORM_DOTS: CatalogPlatform[] = ['macos', 'windows', 'linux'];
const PLATFORM_TITLE: Record<CatalogPlatform, string> = { macos: 'macOS', windows: 'Windows', linux: 'Linux' };

const AppCatalog = ({ selectedAppIds, onToggle }: AppCatalogProps): React.JSX.Element => {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const categories = useMemo(() => getCategories(APPS_CATALOG.apps), []);

    const filtered = useMemo(() => filterCatalog(APPS_CATALOG.apps, search, activeCategory), [search, activeCategory]);

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
                            <tr key={app.id} onClick={() => onToggle(app)} style={{ cursor: 'pointer' }}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedAppIds.has(app.id)}
                                        onChange={() => onToggle(app)}
                                        onClick={(e) => e.stopPropagation()}
                                        aria-label={`Select ${app.name}`}
                                        data-testid={`select-app-${app.id}`}
                                    />
                                </td>
                                <td>{app.name}</td>
                                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{app.category}</td>
                                <td>
                                    <div className="installer-avail">
                                        {PLATFORM_DOTS.map((p) => (
                                            <span
                                                key={p}
                                                className={`installer-avail__dot${app.platforms[p] ? ' on' : ''}`}
                                                title={`${PLATFORM_TITLE[p]}: ${app.platforms[p] ? 'available' : 'unavailable'}`}
                                            />
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
