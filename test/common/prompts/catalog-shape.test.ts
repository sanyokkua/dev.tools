import { prompts as aAllPrompts } from '@/common/prompts/catalog/a-software-engineering';
import { prompts as a01Prompts } from '@/common/prompts/catalog/a-software-engineering/a01-code-generation';
import { prompts as bAllPrompts } from '@/common/prompts/catalog/b-writing-communication';
import { prompts as b01Prompts } from '@/common/prompts/catalog/b-writing-communication/b01-proofreading';
import { prompts as cAllPrompts } from '@/common/prompts/catalog/c-thinking-productivity';
import { prompts as c01Prompts } from '@/common/prompts/catalog/c-thinking-productivity/c01-ideation';
import type { LogicalPromptDef } from '@/common/prompts/model/types';

const VALID_CONTROLS = ['textarea', 'text', 'select', 'combobox'];
const VALID_EXECUTION_CONTEXTS = ['chat', 'agent'];
const VALID_MODE_CLASSES = ['chat-only', 'chat-only-meta', 'dual', 'agent-only'];

function validateDef(def: LogicalPromptDef) {
    expect(typeof def.id).toBe('string');
    expect(def.id.length).toBeGreaterThan(0);
    expect(typeof def.categoryCode).toBe('string');
    expect(typeof def.title).toBe('string');
    expect(Array.isArray(def.variants)).toBe(true);
    expect(def.variants.length).toBeGreaterThan(0);
    expect(def.variants.map((v) => v.id)).toContain(def.defaultVariantId);
    if (def.modeClass) {
        expect(VALID_MODE_CLASSES).toContain(def.modeClass);
    }
    for (const v of def.variants) {
        expect(typeof v.id).toBe('string');
        expect(VALID_EXECUTION_CONTEXTS).toContain(v.executionContext);
        expect(typeof v.template).toBe('string');
        expect(v.template.length).toBeGreaterThan(0);
        expect(Array.isArray(v.keywords)).toBe(true);
        expect(Array.isArray(v.parameters)).toBe(true);
        for (const p of v.parameters) {
            expect(VALID_CONTROLS).toContain(p.control);
        }
        const usedTokens = [...v.template.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);
        const declaredNames = v.parameters.map((p) => p.name);
        for (const token of usedTokens) {
            expect(declaredNames).toContain(token);
        }
        expect(Array.isArray(v.relatedSkillIds)).toBe(true);
    }
}

describe('A01 Code Generation catalog module', () => {
    it('exports a non-empty prompts array', () => {
        expect(Array.isArray(a01Prompts)).toBe(true);
        expect(a01Prompts.length).toBeGreaterThanOrEqual(8);
    });

    it('all entries pass shape validation', () => {
        for (const def of a01Prompts) {
            validateDef(def);
        }
    });

    it('contains a system prompt as the first entry', () => {
        const sys = a01Prompts.find((d) => d.variants.some((v) => v.kind === 'system'));
        expect(sys).toBeDefined();
        expect(sys?.variants[0].kind).toBe('system');
    });

    it('dual LP-A01-from-spec has both chat and agent variants', () => {
        const fromSpec = a01Prompts.find((d) => d.id === 'LP-A01-from-spec');
        expect(fromSpec).toBeDefined();
        expect(fromSpec?.modeClass).toBe('dual');
        const contexts = fromSpec?.variants.map((v) => v.executionContext) ?? [];
        expect(contexts).toContain('chat');
        expect(contexts).toContain('agent');
    });

    it('all logical IDs are unique within A01', () => {
        const ids = a01Prompts.map((d) => d.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
});

describe('C01 Ideation catalog module', () => {
    it('exports a non-empty prompts array', () => {
        expect(c01Prompts.length).toBeGreaterThanOrEqual(5);
    });

    it('all entries pass shape validation', () => {
        for (const def of c01Prompts) {
            validateDef(def);
        }
    });

    it('LP-C01-scenarios uses scenario-type valueSetId', () => {
        const scenarios = c01Prompts.find((d) => d.id === 'LP-C01-scenarios');
        expect(scenarios).toBeDefined();
        const param = scenarios?.variants[0].parameters.find((p) => p.name === 'scenarioType');
        expect(param?.valueSetId).toBe('scenario-type');
    });

    it('C01 system prompt has modeClass chat-only-meta', () => {
        const sys = c01Prompts.find((d) => d.variants.some((v) => v.kind === 'system'));
        expect(sys).toBeDefined();
        expect(sys?.modeClass).toBe('chat-only-meta');
    });
});

describe('Domain A barrel', () => {
    it('exports all 11 categories worth of prompts', () => {
        expect(aAllPrompts.length).toBeGreaterThan(50);
    });

    it('all logical IDs are unique across Domain A', () => {
        const ids = aAllPrompts.map((d) => d.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('all entries pass shape validation', () => {
        for (const def of aAllPrompts) {
            validateDef(def);
        }
    });
});

describe('B01 Proofreading catalog module', () => {
    it('exports a non-empty prompts array', () => {
        expect(Array.isArray(b01Prompts)).toBe(true);
        expect(b01Prompts.length).toBeGreaterThanOrEqual(5);
    });

    it('all entries pass shape validation', () => {
        for (const def of b01Prompts) {
            validateDef(def);
        }
    });

    it('all logical IDs are unique within B01', () => {
        const ids = b01Prompts.map((d) => d.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
});

describe('Domain B barrel', () => {
    it('exports all 9 categories worth of prompts', () => {
        expect(bAllPrompts.length).toBeGreaterThan(80);
    });

    it('all logical IDs are unique across Domain B', () => {
        const ids = bAllPrompts.map((d) => d.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('all entries pass shape validation', () => {
        for (const def of bAllPrompts) {
            validateDef(def);
        }
    });
});

describe('Domain C barrel', () => {
    it('exports all 4 categories worth of prompts', () => {
        expect(cAllPrompts.length).toBeGreaterThan(15);
    });

    it('all logical IDs are unique across Domain C', () => {
        const ids = cAllPrompts.map((d) => d.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('all entries pass shape validation', () => {
        for (const def of cAllPrompts) {
            validateDef(def);
        }
    });
});
