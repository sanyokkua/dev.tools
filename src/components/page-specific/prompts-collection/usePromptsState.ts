import { useRouter } from 'next/router';
import type { ParsedUrlQuery } from 'querystring';
import { useCallback } from 'react';

export interface PromptsPageState {
    type: 'prompts' | 'skills';
    domainSlug: string | null;
    categorySlug: string | null;
    selectedId: string | null; // LogicalPrompt.id (prompts) or Skill.slug (skills)
}

export function parseStateFromQuery(query: ParsedUrlQuery): PromptsPageState {
    const type = query['type'] === 'skills' ? 'skills' : 'prompts';
    const domainSlug = typeof query['domain'] === 'string' ? query['domain'] : null;
    const categorySlug = typeof query['category'] === 'string' ? query['category'] : null;
    const promptId = typeof query['prompt'] === 'string' ? query['prompt'] : null;
    const skillSlug = typeof query['skill'] === 'string' ? query['skill'] : null;
    const selectedId = type === 'skills' ? skillSlug : promptId;
    return { type, domainSlug, categorySlug, selectedId };
}

export function stateToQuery(state: PromptsPageState): Record<string, string> {
    const q: Record<string, string> = {};
    if (state.type === 'skills') q['type'] = 'skills';
    if (state.domainSlug) q['domain'] = state.domainSlug;
    if (state.categorySlug) q['category'] = state.categorySlug;
    if (state.selectedId) {
        if (state.type === 'skills') q['skill'] = state.selectedId;
        else q['prompt'] = state.selectedId;
    }
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
