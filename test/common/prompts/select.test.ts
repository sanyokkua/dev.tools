import type { LogicalPromptDef, PromptVariant } from '../../../src/common/prompts/model/types';
import { preserveParamValues, selectVariant } from '../../../src/common/prompts/select';

const chatVariant: PromptVariant = {
    id: 'v-chat',
    kind: 'user',
    categoryCode: 'A01',
    title: 'Chat variant',
    description: '',
    template: '{{task}}',
    parameters: [
        { name: 'task', control: 'textarea' },
        { name: 'language', control: 'select' },
    ],
    keywords: [],
    executionContext: 'chat',
    model: null,
    subVariant: null,
};

const agentVariant: PromptVariant = {
    ...chatVariant,
    id: 'v-agent',
    title: 'Agent variant',
    executionContext: 'agent',
};

const gptVariant: PromptVariant = {
    ...chatVariant,
    id: 'v-gpt',
    title: 'GPT variant',
    executionContext: 'chat',
    model: 'gpt-4',
};

const claudeVariant: PromptVariant = {
    ...chatVariant,
    id: 'v-claude',
    title: 'Claude variant',
    executionContext: 'chat',
    model: 'claude-3-5',
};

const subA: PromptVariant = { ...chatVariant, id: 'v-sub-a', title: 'Sub A', subVariant: 'short' };

const subB: PromptVariant = { ...chatVariant, id: 'v-sub-b', title: 'Sub B', subVariant: 'long' };

const dualLogical: LogicalPromptDef = {
    id: 'lp-dual',
    categoryCode: 'A01',
    title: 'Dual Prompt',
    description: 'Has chat and agent variants',
    variantAxes: ['mode'],
    variants: [chatVariant, agentVariant],
    defaultVariantId: 'v-chat',
};

const modelLogical: LogicalPromptDef = {
    id: 'lp-model',
    categoryCode: 'A01',
    title: 'Per-model Prompt',
    description: 'Has model variants',
    variantAxes: ['model'],
    variants: [gptVariant, claudeVariant],
    defaultVariantId: 'v-gpt',
};

const subLogical: LogicalPromptDef = {
    id: 'lp-sub',
    categoryCode: 'A01',
    title: 'Sub-variant Prompt',
    description: 'Has sub variants',
    variantAxes: ['subVariant'],
    variants: [subA, subB],
    defaultVariantId: 'v-sub-a',
};

describe('selectVariant', () => {
    describe('mode axis', () => {
        it('selects the chat variant when mode is "chat"', () => {
            expect(selectVariant(dualLogical, { mode: 'chat' })).toBe(chatVariant);
        });

        it('selects the agent variant when mode is "agent"', () => {
            expect(selectVariant(dualLogical, { mode: 'agent' })).toBe(agentVariant);
        });
    });

    describe('model axis', () => {
        it('selects the gpt variant when model is "gpt-4"', () => {
            expect(selectVariant(modelLogical, { model: 'gpt-4' })).toBe(gptVariant);
        });

        it('selects the claude variant when model is "claude-3-5"', () => {
            expect(selectVariant(modelLogical, { model: 'claude-3-5' })).toBe(claudeVariant);
        });
    });

    describe('subVariant axis', () => {
        it('selects subA when sub is "short"', () => {
            expect(selectVariant(subLogical, { sub: 'short' })).toBe(subA);
        });

        it('selects subB when sub is "long"', () => {
            expect(selectVariant(subLogical, { sub: 'long' })).toBe(subB);
        });
    });

    describe('fallback', () => {
        it('returns some variant when axes object is empty', () => {
            const result = selectVariant(dualLogical, {});
            expect(result).toBeDefined();
            expect(dualLogical.variants).toContain(result);
        });

        it('returns a variant from the logical when model is not found', () => {
            const result = selectVariant(modelLogical, { model: 'unknown-model' });
            expect(result).toBeDefined();
            expect(modelLogical.variants).toContain(result);
        });

        it('returns a variant from the logical when mode is not found', () => {
            const chatOnlyLogical: LogicalPromptDef = {
                ...dualLogical,
                variants: [chatVariant],
                defaultVariantId: 'v-chat',
            };
            const result = selectVariant(chatOnlyLogical, { mode: 'agent' });
            expect(result).toBeDefined();
            expect(chatOnlyLogical.variants).toContain(result);
        });
    });

    describe('single variant', () => {
        it('returns the only variant regardless of axes', () => {
            const singleLogical: LogicalPromptDef = {
                id: 'lp-single',
                categoryCode: 'A01',
                title: 'Single',
                description: '',
                variantAxes: [],
                variants: [chatVariant],
                defaultVariantId: 'v-chat',
            };
            expect(selectVariant(singleLogical, {})).toBe(chatVariant);
            expect(selectVariant(singleLogical, { mode: 'agent' })).toBe(chatVariant);
        });
    });
});

describe('preserveParamValues', () => {
    const nextVariant: PromptVariant = {
        ...chatVariant,
        id: 'v-next',
        parameters: [
            { name: 'task', control: 'textarea' },
            { name: 'output_format', control: 'select' },
        ],
    };

    it('preserves values for params with matching names in the next variant', () => {
        const prevValues = { task: 'Write tests', language: 'TypeScript' };
        const result = preserveParamValues(prevValues, chatVariant, nextVariant);
        expect(result.task).toBe('Write tests');
    });

    it('does not carry over params that do not exist in the next variant', () => {
        const prevValues = { task: 'Write tests', language: 'TypeScript' };
        const result = preserveParamValues(prevValues, chatVariant, nextVariant);
        expect(result).not.toHaveProperty('language');
    });

    it('does not include params that had empty string values in the previous variant', () => {
        const prevValues = { task: '' };
        const result = preserveParamValues(prevValues, chatVariant, nextVariant);
        expect(result).not.toHaveProperty('task');
    });

    it('returns empty object when no param names match', () => {
        const prevValues = { language: 'Go' };
        const result = preserveParamValues(prevValues, chatVariant, nextVariant);
        expect(result).toEqual({});
    });

    it('returns empty object when prevValues is empty', () => {
        const result = preserveParamValues({}, chatVariant, nextVariant);
        expect(result).toEqual({});
    });
});
