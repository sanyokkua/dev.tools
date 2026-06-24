import { selectVariant } from '@/common/prompts/data';
import type { PaletteResult } from '@/common/prompts/fuzzy';
import { getLogicalPrompt, loadManifest, loadSkill } from '@/common/prompts/loader';
import type {
    LogicalPromptDef,
    Manifest,
    ManifestLogical,
    ManifestSkill,
    PromptVariant,
    SkillDef,
} from '@/common/prompts/model/types';
import { CONTEXTS } from '@/common/prompts/registries';
import type { CatalogRow } from '@/common/prompts/types';
import Chip from '@/controls/Chip';
import SegmentedControl from '@/controls/SegmentedControl';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CommandPalette from './CommandPalette';
import PromptCatalogView from './PromptCatalogView';
import PromptDetailPanel from './PromptDetailPanel';
import PromptListItem from './PromptListItem';
import SkillDetailPanel from './SkillDetailPanel';
import SkillListItem from './SkillListItem';
import { parseStateFromQuery, stateToQuery, type PromptsPageState } from './usePromptsState';

const PromptsCollectionView: React.FC = () => {
    const manifest: Manifest = useMemo(() => loadManifest(), []);
    const [selectedPromptDef, setSelectedPromptDef] = useState<LogicalPromptDef | null>(null);
    const [selectedSkillDef, setSelectedSkillDef] = useState<SkillDef | null>(null);
    const [pageState, setPageState] = useState<PromptsPageState>({
        type: 'prompts',
        view: null,
        domainSlug: null,
        categorySlug: null,
        selectedId: null,
        variantContext: null,
        variantModel: null,
        variantSub: null,
        style: null,
        tone: null,
        context: null,
    });
    const [search, setSearch] = useState('');
    const [paletteOpen, setPaletteOpen] = useState(false);
    const router = useRouter();

    // Serialize query to a stable string — prevents re-running when router creates a new query object reference
    const queryStr = JSON.stringify(router.query);
    useEffect(() => {
        if (!router.isReady) return;
        setPageState(parseStateFromQuery(router.query));
    }, [router.isReady, queryStr]); // queryStr is a stable proxy for router.query values

    // Lazy-load the full logical prompt def when a prompt is selected
    useEffect(() => {
        if (pageState.type !== 'prompts' || !pageState.selectedId) {
            setSelectedPromptDef(null);
            return;
        }
        getLogicalPrompt(pageState.selectedId)
            .then(setSelectedPromptDef)
            .catch(() => setSelectedPromptDef(null));
    }, [pageState.selectedId, pageState.type]);

    // Lazy-load the full skill def when a skill is selected
    useEffect(() => {
        if (pageState.type !== 'skills' || !pageState.selectedId) {
            setSelectedSkillDef(null);
            return;
        }
        loadSkill(pageState.selectedId)
            .then(setSelectedSkillDef)
            .catch(() => setSelectedSkillDef(null));
    }, [pageState.selectedId, pageState.type]);

    useEffect(() => {
        const handler = (e: KeyboardEvent): void => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setPaletteOpen((open) => !open);
            }
        };
        globalThis.addEventListener('keydown', handler);
        return (): void => globalThis.removeEventListener('keydown', handler);
    }, []);

    // --- Derived selections (synchronous from manifest) ---

    const domains = manifest.domains;

    const skillDomainCodes = useMemo((): Set<string> => new Set(manifest.skills.map((s) => s.domainCode)), [manifest]);

    const effectiveDomains = useMemo(() => {
        if (pageState.type === 'skills') {
            return domains.filter((d) => skillDomainCodes.has(d.code));
        }
        return domains;
    }, [pageState.type, domains, skillDomainCodes]);

    const activeDomain = useMemo(
        () => effectiveDomains.find((d) => d.slug === pageState.domainSlug) ?? effectiveDomains[0] ?? null,
        [effectiveDomains, pageState.domainSlug],
    );

    const categories = useMemo(
        () => manifest.categories.filter((c) => c.domainCode === activeDomain?.code),
        [manifest, activeDomain],
    );

    const activeCategory = useMemo(
        () => categories.find((c) => c.slug === pageState.categorySlug) ?? categories[0] ?? null,
        [categories, pageState.categorySlug],
    );

    const logicals: ManifestLogical[] = useMemo(
        () => manifest.logical.filter((l) => l.categoryCode === activeCategory?.code),
        [manifest, activeCategory],
    );

    const filteredLogicals = useMemo(
        () => (search ? logicals.filter((lp) => lp.title.toLowerCase().includes(search.toLowerCase())) : logicals),
        [logicals, search],
    );

    const skills: ManifestSkill[] = useMemo(
        () => manifest.skills.filter((s) => s.domainCode === activeDomain?.code),
        [manifest, activeDomain],
    );

    const filteredSkills = useMemo(
        () => (search ? skills.filter((s) => s.title.toLowerCase().includes(search.toLowerCase())) : skills),
        [skills, search],
    );

    // Variant selection from loaded def
    const selectedVariant: PromptVariant | null = useMemo(() => {
        if (!selectedPromptDef) return null;
        return (
            (selectVariant(
                selectedPromptDef.variants,
                pageState.variantContext,
                pageState.variantModel,
                pageState.variantSub,
            ) as unknown as PromptVariant | null) ??
            (selectedPromptDef.variants.find(
                (v) => v.id === selectedPromptDef.defaultVariantId,
            ) as unknown as PromptVariant) ??
            null
        );
    }, [selectedPromptDef, pageState.variantContext, pageState.variantModel, pageState.variantSub]);

    // Related skills for SkillDetailPanel (resolved from manifest)
    const relatedSkillMeta = useMemo(() => {
        if (!selectedSkillDef) return [];
        return selectedSkillDef.relatedSkillIds
            .map((id) => {
                const slug = id.startsWith('SKILL-') ? id.slice(6) : id;
                return manifest.skills.find((s) => s.slug === slug);
            })
            .filter(Boolean) as ManifestSkill[];
    }, [selectedSkillDef, manifest]);

    // --- State transitions ---

    const setType = useCallback(
        (type: 'prompts' | 'skills') => {
            const next: PromptsPageState = {
                type,
                view: null,
                domainSlug: null,
                categorySlug: null,
                selectedId: null,
                variantContext: null,
                variantModel: null,
                variantSub: null,
                style: null,
                tone: null,
                context: null,
            };
            setPageState(next);
            void router.replace({ query: stateToQuery(next) }, undefined, { shallow: true, scroll: false });
        },
        [router],
    );

    const setDomain = useCallback(
        (slug: string) => {
            const next: PromptsPageState = { ...pageState, domainSlug: slug, categorySlug: null, selectedId: null };
            setPageState(next);
            void router.replace({ query: stateToQuery(next) }, undefined, { shallow: true, scroll: false });
        },
        [router, pageState],
    );

    const setCategory = useCallback(
        (slug: string) => {
            const next: PromptsPageState = { ...pageState, categorySlug: slug, selectedId: null };
            setPageState(next);
            void router.replace({ query: stateToQuery(next) }, undefined, { shallow: true, scroll: false });
        },
        [router, pageState],
    );

    const setSelected = useCallback(
        (id: string) => {
            const next: PromptsPageState = {
                ...pageState,
                selectedId: id,
                variantContext: null,
                variantModel: null,
                variantSub: null,
                style: null,
                tone: null,
                context: null,
            };
            setPageState(next);
            void router.replace({ query: stateToQuery(next) }, undefined, { shallow: true, scroll: false });
        },
        [router, pageState],
    );

    const onVariantSwitch = useCallback(
        (ctx: 'chat' | 'agent' | null, model: string | null, sub: string | null) => {
            const next: PromptsPageState = { ...pageState, variantContext: ctx, variantModel: model, variantSub: sub };
            setPageState(next);
            void router.replace({ query: stateToQuery(next) }, undefined, { shallow: true, scroll: false });
        },
        [router, pageState],
    );

    const onStyleChange = useCallback(
        (styleId: string | null) => {
            const next: PromptsPageState = { ...pageState, style: styleId, context: null };
            setPageState(next);
            void router.replace({ query: stateToQuery(next) }, undefined, { shallow: true, scroll: false });
        },
        [router, pageState],
    );

    const onToneChange = useCallback(
        (toneId: string | null) => {
            const next: PromptsPageState = { ...pageState, tone: toneId, context: null };
            setPageState(next);
            void router.replace({ query: stateToQuery(next) }, undefined, { shallow: true, scroll: false });
        },
        [router, pageState],
    );

    const onContextChange = useCallback(
        (contextId: string | null) => {
            const ctx = contextId ? (CONTEXTS.find((c) => c.id === contextId) ?? null) : null;
            const next: PromptsPageState = {
                ...pageState,
                context: contextId,
                style: ctx?.styleId ?? null,
                tone: ctx?.toneId ?? null,
            };
            setPageState(next);
            void router.replace({ query: stateToQuery(next) }, undefined, { shallow: true, scroll: false });
        },
        [router, pageState],
    );

    const openCatalog = useCallback(() => {
        const next: PromptsPageState = { ...pageState, view: 'catalog' };
        setPageState(next);
        void router.replace({ query: stateToQuery(next) }, undefined, { shallow: true, scroll: false });
    }, [router, pageState]);

    const closeCatalog = useCallback(() => {
        const next: PromptsPageState = { ...pageState, view: null };
        setPageState(next);
        void router.replace({ query: stateToQuery(next) }, undefined, { shallow: true, scroll: false });
    }, [router, pageState]);

    const navigateToSkill = useCallback(
        (slug: string) => {
            const targetSkill = manifest.skills.find((s) => s.slug === slug);
            if (!targetSkill) return;
            const domain = domains.find((d) => d.code === targetSkill.domainCode);
            const next: PromptsPageState = {
                ...pageState,
                type: 'skills',
                domainSlug: domain?.slug ?? pageState.domainSlug,
                categorySlug: null,
                selectedId: slug,
            };
            setPageState(next);
            void router.replace({ query: stateToQuery(next) }, undefined, { shallow: true, scroll: false });
        },
        [manifest, domains, pageState, router],
    );

    const handleCatalogRowClick = useCallback(
        (row: CatalogRow) => {
            const next: PromptsPageState = {
                type: row.kind === 'skill' ? 'skills' : 'prompts',
                view: null,
                domainSlug: row.domainSlug,
                categorySlug: row.categorySlug,
                selectedId: row.id,
                variantContext: null,
                variantModel: null,
                variantSub: null,
                style: null,
                tone: null,
                context: null,
            };
            setPageState(next);
            void router.replace({ query: stateToQuery(next) }, undefined, { shallow: true, scroll: false });
        },
        [router],
    );

    const handlePaletteSelect = useCallback(
        (result: PaletteResult) => {
            setPaletteOpen(false);
            if (result.type === 'prompt') {
                const entry = result.item as ManifestLogical;
                const cat = manifest.categories.find((c) => c.code === entry.categoryCode);
                const domain = manifest.domains.find((d) => d.code === entry.domainCode);
                if (!cat || !domain) return;
                const next: PromptsPageState = {
                    type: 'prompts',
                    view: null,
                    domainSlug: domain.slug,
                    categorySlug: cat.slug,
                    selectedId: entry.id,
                    variantContext: null,
                    variantModel: null,
                    variantSub: null,
                    style: null,
                    tone: null,
                    context: null,
                };
                setPageState(next);
                void router.replace({ query: stateToQuery(next) }, undefined, { shallow: true, scroll: false });
            } else {
                const s = result.item as ManifestSkill;
                navigateToSkill(s.slug);
            }
        },
        [manifest, navigateToSkill, router],
    );

    // --- Catalog branch ---
    if (pageState.view === 'catalog') {
        return (
            <div className="pc-view">
                <PromptCatalogView manifest={manifest} onRowClick={handleCatalogRowClick} onBack={closeCatalog} />
            </div>
        );
    }

    return (
        <div className="pc-view">
            {/* Header */}
            <div className="pc-header">
                <div className="pc-header-top">
                    <div className="pc-header-left">
                        <SegmentedControl
                            options={[
                                { value: 'prompts', label: 'Prompts' },
                                { value: 'skills', label: 'Skills' },
                            ]}
                            value={pageState.type}
                            onChange={(v) => setType(v as 'prompts' | 'skills')}
                            aria-label="View type"
                        />
                    </div>
                    <div className="pc-header-right">
                        <input
                            className="pc-search-input"
                            placeholder="search this collection…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Search prompts"
                        />
                        <button className="btn tonal sm" onClick={openCatalog} aria-label="Browse all catalog">
                            ▤ Browse all catalog
                        </button>
                        <button
                            className="btn tonal sm"
                            onClick={() => setPaletteOpen(true)}
                            aria-label="Open quick search (⌘K)"
                            data-testid="cmd-palette-trigger"
                            title="Quick search ⌘K"
                        >
                            ⌘K
                        </button>
                    </div>
                </div>

                {/* Domain Tabs */}
                <div role="tablist" aria-label="Domain" className="pc-domain-tabs">
                    {effectiveDomains.map((d) => (
                        <button
                            key={d.slug}
                            role="tab"
                            aria-selected={activeDomain?.slug === d.slug}
                            className={`pc-domain-tab${activeDomain?.slug === d.slug ? ' on' : ''}`}
                            onClick={() => setDomain(d.slug)}
                        >
                            {d.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sub-tabs (categories in Prompts mode only) */}
            {pageState.type === 'prompts' && (
                <div className="pc-subtabs" role="tablist" aria-label="Category">
                    {categories.map((c) => (
                        <Chip
                            key={c.slug}
                            text={c.title}
                            selected={activeCategory?.slug === c.slug}
                            onClick={() => setCategory(c.slug)}
                        />
                    ))}
                </div>
            )}

            {/* Two-pane body */}
            <div className="pc-body">
                <div
                    className="pc-list-col"
                    role="listbox"
                    aria-label={pageState.type === 'skills' ? 'Skills' : 'Prompts'}
                >
                    <div className="pc-list-header">
                        {pageState.type === 'prompts'
                            ? `${activeCategory?.title ?? ''} · ${filteredLogicals.length} prompt${filteredLogicals.length !== 1 ? 's' : ''}`
                            : `${activeDomain?.title ?? ''} · ${filteredSkills.length} skill${filteredSkills.length !== 1 ? 's' : ''}`}
                    </div>
                    {pageState.type === 'prompts'
                        ? filteredLogicals.map((lp) => (
                              <PromptListItem
                                  key={lp.id}
                                  logical={lp}
                                  selected={lp.id === pageState.selectedId}
                                  onClick={() => setSelected(lp.id)}
                              />
                          ))
                        : filteredSkills.map((s) => (
                              <SkillListItem
                                  key={s.slug}
                                  skill={s}
                                  selected={s.slug === pageState.selectedId}
                                  onClick={() => setSelected(s.slug)}
                              />
                          ))}
                </div>

                <div className="pc-detail-col">
                    {pageState.type === 'prompts' ? (
                        <PromptDetailPanel
                            logical={selectedPromptDef}
                            variant={selectedVariant}
                            variants={selectedPromptDef?.variants ?? []}
                            domain={activeDomain}
                            category={activeCategory}
                            onVariantSwitch={onVariantSwitch}
                            style={pageState.style}
                            tone={pageState.tone}
                            context={pageState.context}
                            onStyleChange={onStyleChange}
                            onToneChange={onToneChange}
                            onContextChange={onContextChange}
                        />
                    ) : (
                        <SkillDetailPanel
                            skill={selectedSkillDef}
                            relatedSkills={relatedSkillMeta}
                            onSelectSkill={navigateToSkill}
                        />
                    )}
                </div>
            </div>

            <CommandPalette
                isOpen={paletteOpen}
                onClose={() => setPaletteOpen(false)}
                manifest={manifest}
                onSelect={handlePaletteSelect}
            />
        </div>
    );
};

PromptsCollectionView.displayName = 'PromptsCollectionView';
export default PromptsCollectionView;
