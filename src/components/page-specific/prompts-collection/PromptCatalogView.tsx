import { buildCatalogRowHref, buildCatalogRows, filterCatalogRows } from '@/common/prompts/data';
import type { Manifest } from '@/common/prompts/model/types';
import type { CatalogRow } from '@/common/prompts/types';
import { useToast } from '@/contexts/ToasterContext';
import Chip from '@/controls/Chip';
import React, { useCallback, useMemo, useState } from 'react';

interface PromptCatalogViewProps {
    manifest: Manifest;
    onRowClick: (row: CatalogRow) => void;
    onBack: () => void;
}

const TYPE_FACETS: { key: string; label: string }[] = [
    { key: 'chat', label: 'chat' },
    { key: 'agent', label: 'agent' },
    { key: 'model', label: 'model' },
    { key: 'meta', label: '⚗ meta-prompt' },
    { key: 'skill', label: '🧩 skill' },
];

const PromptCatalogView: React.FC<PromptCatalogViewProps> = ({ manifest, onRowClick, onBack }) => {
    const { showToast } = useToast();
    const [text, setText] = useState('');
    const [domainFacet, setDomainFacet] = useState<string | null>(null);
    const [typeFacets, setTypeFacets] = useState<Set<string>>(new Set());

    const allRows = useMemo(() => buildCatalogRows(manifest), [manifest]);
    const filtered = useMemo(
        () => filterCatalogRows(allRows, text, domainFacet, typeFacets),
        [allRows, text, domainFacet, typeFacets],
    );

    const domains = useMemo(() => manifest.domains, [manifest]);
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

    const toggleTypeFacet = useCallback((key: string) => {
        setTypeFacets((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }, []);

    const clearAll = useCallback(() => {
        setDomainFacet(null);
        setTypeFacets(new Set());
    }, []);

    const handleShare = useCallback(
        (e: React.MouseEvent, row: CatalogRow) => {
            e.stopPropagation();
            const url = buildCatalogRowHref(row, basePath);
            void navigator.clipboard.writeText(url).then(() => showToast({ message: 'Link copied' }));
        },
        [basePath, showToast],
    );

    const isAllActive = !domainFacet && typeFacets.size === 0;

    return (
        <div className="pc-catalog">
            <div className="pc-catalog-header">
                <button className="pc-catalog-back btn ghost sm" onClick={onBack} aria-label="Back">
                    ‹ Back
                </button>
                <span className="pc-catalog-title">All prompts &amp; skills</span>
                <input
                    className="pc-catalog-search pc-search-input"
                    placeholder={`search all ${allRows.length} items by name, keyword, model…`}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    aria-label="Search catalog"
                />
            </div>

            <div className="pc-catalog-facets" role="group" aria-label="Filter catalog">
                <span className="pc-catalog-facet-label">Filter:</span>
                <Chip text="All" selected={isAllActive} onClick={clearAll} />
                {domains.map((d) => (
                    <Chip
                        key={d.slug}
                        text={d.title}
                        selected={domainFacet === d.slug}
                        onClick={() => setDomainFacet(domainFacet === d.slug ? null : d.slug)}
                    />
                ))}
                <span className="pc-catalog-facet-sep" />
                {TYPE_FACETS.map((f) => (
                    <Chip
                        key={f.key}
                        text={f.label}
                        selected={typeFacets.has(f.key)}
                        onClick={() => toggleTypeFacet(f.key)}
                    />
                ))}
            </div>

            <div className="pc-catalog-scroll">
                <table className="pc-catalog-table" aria-label="All prompts and skills">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Domain → Category</th>
                            <th>Type</th>
                            <th>Mode</th>
                            <th>Variants</th>
                            <th aria-label="Share" />
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((row) => (
                            <tr
                                key={`${row.kind}-${row.id}`}
                                className="pc-catalog-row"
                                onClick={() => onRowClick(row)}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') onRowClick(row);
                                }}
                                role="button"
                                aria-label={`Open ${row.title}`}
                            >
                                <td className="pc-catalog-name">{row.title}</td>
                                <td className="pc-catalog-breadcrumb">
                                    {row.domainTitle}
                                    {row.kind === 'skill' ? ' · Skill' : ` › ${row.categoryTitle}`}
                                </td>
                                <td>
                                    {row.kind === 'skill' ? (
                                        <span className="pc-tag">🧩 skill</span>
                                    ) : row.isMetaPrompt ? (
                                        <span className="pc-tag pc-tag-meta">⚗ meta-prompt</span>
                                    ) : (
                                        <span className="pc-tag">direct</span>
                                    )}
                                </td>
                                <td className="pc-catalog-mode">
                                    {row.kind === 'skill' ? (
                                        '—'
                                    ) : row.hasChat && row.hasAgent ? (
                                        <span className="pc-tag">Dual</span>
                                    ) : row.hasChat ? (
                                        <span className="pc-tag">Chat</span>
                                    ) : row.hasAgent ? (
                                        <span className="pc-tag pc-tag-alt">Agent</span>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td className="pc-catalog-variants">{row.variantSummary}</td>
                                <td>
                                    <button
                                        className="pc-catalog-share"
                                        onClick={(e) => handleShare(e, row)}
                                        aria-label={`Copy link for ${row.title}`}
                                        title="Copy link"
                                    >
                                        🔗
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="pc-catalog-empty">
                                    No results for &quot;{text}&quot;
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

PromptCatalogView.displayName = 'PromptCatalogView';
export default PromptCatalogView;
