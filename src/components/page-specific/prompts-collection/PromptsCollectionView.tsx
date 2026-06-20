import {
    categoriesByDomain,
    defaultVariant,
    findVariantById,
    listDomains,
    loadPromptsData,
    loadSkillsData,
    logicalByCategory,
    selectVariant,
    skillsByDomain,
    variantsOf,
} from '@/common/prompts/data';
import type { PromptsData, SkillsData } from '@/common/prompts/types';
import Chip from '@/controls/Chip';
import SegmentedControl from '@/controls/SegmentedControl';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PromptDetailPanel from './PromptDetailPanel';
import PromptListItem from './PromptListItem';
import SkillDetailPanel from './SkillDetailPanel';
import SkillListItem from './SkillListItem';
import { parseStateFromQuery, stateToQuery, type PromptsPageState } from './usePromptsState';

const PromptsCollectionView: React.FC = () => {
    const [promptsData, setPromptsData] = useState<PromptsData | null>(null);
    const [skillsData, setSkillsData] = useState<SkillsData | null>(null);
    const [pageState, setPageState] = useState<PromptsPageState>({
        type: 'prompts',
        view: null,
        domainSlug: null,
        categorySlug: null,
        selectedId: null,
        variantContext: null,
        variantModel: null,
        variantSub: null,
    });
    const [search, setSearch] = useState('');
    const router = useRouter();

    // Serialize query to a stable string — prevents re-running when router creates a new query object reference
    const queryStr = JSON.stringify(router.query);
    useEffect(() => {
        if (!router.isReady) return;
        setPageState(parseStateFromQuery(router.query));
    }, [router.isReady, queryStr]); // queryStr is a stable proxy for router.query values

    // Load data on mount
    useEffect(() => {
        loadPromptsData().then(setPromptsData);
        loadSkillsData().then(setSkillsData);
    }, []);

    // --- Derived selections ---

    // Full domain list (from promptsData — used as the source of truth for all domains)
    const domains = useMemo(() => (promptsData ? listDomains(promptsData) : []), [promptsData]);

    // Skill domain codes (set for O(1) lookup)
    const skillDomainCodes = useMemo(() => {
        if (!skillsData) return new Set<string>();
        return new Set(skillsData.skills.map((s) => s.domainCode));
    }, [skillsData]);

    // In skills mode, only show domains that have skills
    const effectiveDomains = useMemo(() => {
        if (pageState.type === 'skills') {
            return domains.filter((d) => skillDomainCodes.has(d.code));
        }
        return domains;
    }, [pageState.type, domains, skillDomainCodes]);

    // activeDomain is resolved against effectiveDomains so skills mode always lands on a valid domain
    const activeDomain = useMemo(
        () => effectiveDomains.find((d) => d.slug === pageState.domainSlug) ?? effectiveDomains[0] ?? null,
        [effectiveDomains, pageState.domainSlug],
    );

    const categories = useMemo(
        () => (promptsData && activeDomain ? categoriesByDomain(promptsData, activeDomain.code) : []),
        [promptsData, activeDomain],
    );

    const activeCategory = useMemo(
        () => categories.find((c) => c.slug === pageState.categorySlug) ?? categories[0] ?? null,
        [categories, pageState.categorySlug],
    );

    const logicals = useMemo(
        () => (promptsData && activeCategory ? logicalByCategory(promptsData, activeCategory.code) : []),
        [promptsData, activeCategory],
    );

    const filteredLogicals = useMemo(
        () => (search ? logicals.filter((lp) => lp.title.toLowerCase().includes(search.toLowerCase())) : logicals),
        [logicals, search],
    );

    const skills = useMemo(
        () => (skillsData && activeDomain ? skillsByDomain(skillsData, activeDomain.code) : []),
        [skillsData, activeDomain],
    );

    const filteredSkills = useMemo(
        () => (search ? skills.filter((s) => s.title.toLowerCase().includes(search.toLowerCase())) : skills),
        [skills, search],
    );

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

    // --- Resolved selections for detail panel ---

    const selectedLogical = useMemo(
        () => (pageState.selectedId ? (logicals.find((lp) => lp.id === pageState.selectedId) ?? null) : null),
        [logicals, pageState.selectedId],
    );

    const allVariants = useMemo(
        () => (promptsData && selectedLogical ? variantsOf(promptsData, selectedLogical.id) : []),
        [promptsData, selectedLogical],
    );

    const selectedVariant = useMemo(() => {
        if (!promptsData) return null;
        if (selectedLogical) {
            return (
                selectVariant(
                    variantsOf(promptsData, selectedLogical.id),
                    pageState.variantContext,
                    pageState.variantModel,
                    pageState.variantSub,
                ) ??
                defaultVariant(promptsData, selectedLogical.id) ??
                null
            );
        }
        if (pageState.selectedId) return findVariantById(promptsData, pageState.selectedId) ?? null;
        return null;
    }, [
        promptsData,
        selectedLogical,
        pageState.selectedId,
        pageState.variantContext,
        pageState.variantModel,
        pageState.variantSub,
    ]);

    const selectedSkill = useMemo(
        () => (pageState.selectedId ? (skills.find((s) => s.slug === pageState.selectedId) ?? null) : null),
        [skills, pageState.selectedId],
    );

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
                                  variants={promptsData ? variantsOf(promptsData, lp.id) : []}
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
                            logical={selectedLogical}
                            variant={selectedVariant}
                            variants={allVariants}
                            domain={activeDomain}
                            category={activeCategory}
                            onVariantSwitch={onVariantSwitch}
                        />
                    ) : (
                        <SkillDetailPanel skill={selectedSkill} />
                    )}
                </div>
            </div>

            {/* Loading overlay */}
            {(!promptsData || !skillsData) && (
                <div className="pc-loading" aria-busy="true">
                    Loading…
                </div>
            )}
        </div>
    );
};

PromptsCollectionView.displayName = 'PromptsCollectionView';
export default PromptsCollectionView;
