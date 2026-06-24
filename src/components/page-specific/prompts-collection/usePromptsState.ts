import { useRouter } from 'next/router';
import type { ParsedUrlQuery } from 'node:querystring';
import { useCallback } from 'react';

export interface PromptsPageState {
    type: 'prompts' | 'skills';
    view: 'catalog' | null;
    domainSlug: string | null;
    categorySlug: string | null;
    selectedId: string | null; // LogicalPrompt.id (prompts) or Skill.slug (skills)
    variantContext: 'chat' | 'agent' | null;
    variantModel: string | null;
    variantSub: string | null;
    style: string | null; // NEW
    tone: string | null; // NEW
    context: string | null; // NEW
}

export function parseStateFromQuery(query: ParsedUrlQuery): PromptsPageState {
    const type = query['type'] === 'skills' ? 'skills' : 'prompts';
    const domainSlug = typeof query['domain'] === 'string' ? query['domain'] : null;
    const categorySlug = typeof query['category'] === 'string' ? query['category'] : null;
    const promptId = typeof query['prompt'] === 'string' ? query['prompt'] : null;
    const skillSlug = typeof query['skill'] === 'string' ? query['skill'] : null;
    const selectedId = type === 'skills' ? skillSlug : promptId;
    const rawVariant = query['variant'];
    const variantContext = rawVariant === 'chat' ? 'chat' : rawVariant === 'agent' ? 'agent' : null;
    const variantModel = typeof query['model'] === 'string' ? query['model'] : null;
    const variantSub = typeof query['sub'] === 'string' ? query['sub'] : null;
    const view = query['view'] === 'catalog' ? 'catalog' : null;
    const style = typeof query['style'] === 'string' ? query['style'] : null;
    const tone = typeof query['tone'] === 'string' ? query['tone'] : null;
    const context = typeof query['context'] === 'string' ? query['context'] : null;
    return {
        type,
        view,
        domainSlug,
        categorySlug,
        selectedId,
        variantContext,
        variantModel,
        variantSub,
        style,
        tone,
        context,
    };
}

export function stateToQuery(state: PromptsPageState): Record<string, string> {
    const q: Record<string, string> = {};
    if (state.type === 'skills') q['type'] = 'skills';
    if (state.view === 'catalog') q['view'] = 'catalog';
    if (state.domainSlug) q['domain'] = state.domainSlug;
    if (state.categorySlug) q['category'] = state.categorySlug;
    if (state.selectedId) {
        if (state.type === 'skills') q['skill'] = state.selectedId;
        else q['prompt'] = state.selectedId;
    }
    if (state.variantContext) q['variant'] = state.variantContext;
    if (state.variantModel) q['model'] = state.variantModel;
    if (state.variantSub) q['sub'] = state.variantSub;
    if (state.style) q['style'] = state.style;
    if (state.tone) q['tone'] = state.tone;
    if (state.context) q['context'] = state.context;
    return q;
}

export function usePromptsState(): {
    update: (patch: Partial<PromptsPageState>, base: PromptsPageState) => PromptsPageState;
} {
    const router = useRouter();

    const update = useCallback(
        (patch: Partial<PromptsPageState>, base: PromptsPageState) => {
            const next = { ...base, ...patch };
            void router.replace({ query: stateToQuery(next) }, undefined, { shallow: true, scroll: false });
            return next;
        },
        [router],
    );

    return { update };
}
