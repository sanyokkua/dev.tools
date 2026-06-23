import { assemblePrompt } from '@/common/prompts/assemble';
import { prompts as aAllPrompts } from '@/common/prompts/catalog/a-software-engineering';
import { prompts as a01Prompts } from '@/common/prompts/catalog/a-software-engineering/a01-code-generation';
import { prompts as bAllPrompts } from '@/common/prompts/catalog/b-writing-communication';
import { prompts as b01Prompts } from '@/common/prompts/catalog/b-writing-communication/b01-proofreading';
import { prompts as b04Prompts } from '@/common/prompts/catalog/b-writing-communication/b04-style';
import { prompts as b09Prompts } from '@/common/prompts/catalog/b-writing-communication/b09-workplace-communication';
import { prompts as cAllPrompts } from '@/common/prompts/catalog/c-thinking-productivity';
import { prompts as c01Prompts } from '@/common/prompts/catalog/c-thinking-productivity/c01-ideation';
import { prompts as dAllPrompts } from '@/common/prompts/catalog/d-ai-prompt-workflows';
import { prompts as d01Prompts } from '@/common/prompts/catalog/d-ai-prompt-workflows/d01-prompt-engineering';
import { prompts as d02Prompts } from '@/common/prompts/catalog/d-ai-prompt-workflows/d02-image-generation';
import { prompts as d03Prompts } from '@/common/prompts/catalog/d-ai-prompt-workflows/d03-image-editing';
import { prompts as d04Prompts } from '@/common/prompts/catalog/d-ai-prompt-workflows/d04-diagrams';
import { prompts as d05Prompts } from '@/common/prompts/catalog/d-ai-prompt-workflows/d05-skill-authoring';
import { prompts as d06Prompts } from '@/common/prompts/catalog/d-ai-prompt-workflows/d06-video-generation';
import type { LogicalPromptDef } from '@/common/prompts/model/types';
import { MODELS } from '@/common/prompts/registries/models';

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

describe('B driver prompts — [[INJECT_RULES]] and supports flags', () => {
    it('LP-B-style-tone-rewrite has [[INJECT_RULES]] in template', () => {
        const p = b04Prompts.find((d) => d.id === 'LP-B-style-tone-rewrite');
        expect(p).toBeDefined();
        expect(p!.variants[0].template).toContain('[[INJECT_RULES]]');
        expect(p!.variants[0].template).not.toContain('{{style}}');
        expect(p!.variants[0].template).not.toContain('{{tone}}');
    });

    it('LP-B-style-tone-rewrite supports style and tone injection', () => {
        const p = b04Prompts.find((d) => d.id === 'LP-B-style-tone-rewrite');
        expect(p!.variants[0].supports?.style).toBe(true);
        expect(p!.variants[0].supports?.tone).toBe(true);
        expect(p!.variants[0].supports?.context).toBe(false);
    });

    it('LP-B-context-write has [[INJECT_RULES]] in template', () => {
        const p = b09Prompts.find((d) => d.id === 'LP-B-context-write');
        expect(p).toBeDefined();
        expect(p!.variants[0].template).toContain('[[INJECT_RULES]]');
        expect(p!.variants[0].template).not.toContain('{{context}}');
    });

    it('LP-B-context-write supports context injection', () => {
        const p = b09Prompts.find((d) => d.id === 'LP-B-context-write');
        expect(p!.variants[0].supports?.context).toBe(true);
    });

    it('all LP-B-context-* dedicated prompts have [[INJECT_RULES]] and supports.context', () => {
        const ctxPrompts = b09Prompts.filter((d) => d.id.startsWith('LP-B-context-') && d.id !== 'LP-B-context-write');
        expect(ctxPrompts.length).toBeGreaterThanOrEqual(10);
        for (const def of ctxPrompts) {
            const v = def.variants[0];
            expect(v.template).toContain('[[INJECT_RULES]]');
            expect(v.template).not.toContain('{{context}}');
            expect(v.supports?.context).toBe(true);
        }
    });
});

describe('B driver prompt assembly — assemblePrompt integration', () => {
    it('assemblePrompt injects style+tone rule blocks via [[INJECT_RULES]]', () => {
        const p = b04Prompts.find((d) => d.id === 'LP-B-style-tone-rewrite')!;
        const result = assemblePrompt(p.variants[0], {
            paramValues: { user_text: 'hello world', user_format: 'Plain text' },
            style: 'formal',
            tone: 'warm',
        });
        expect(result).toContain('STYLE');
        expect(result).toContain('TONE');
        expect(result).toContain('hello world');
        expect(result).not.toContain('[[INJECT_RULES]]');
    });

    it('assemblePrompt injects context rule block for LP-B-context-write', () => {
        const p = b09Prompts.find((d) => d.id === 'LP-B-context-write')!;
        const result = assemblePrompt(p.variants[0], {
            paramValues: { user_text: 'test message', user_format: 'Plain text' },
            context: 'manager',
        });
        expect(result).not.toContain('[[INJECT_RULES]]');
        expect(result).toContain('test message');
    });
});

describe('D01 Prompt Engineering catalog module', () => {
    it('exports 6 prompts (1 system + 5 logical)', () => {
        expect(d01Prompts.length).toBe(6);
    });

    it('system prompt has correct id and kind', () => {
        const sys = d01Prompts.find((d) => d.id === 'SYS-D01-prompt-engineering');
        expect(sys).toBeDefined();
        expect(sys!.variants[0].kind).toBe('system');
    });

    it('all 5 logical prompts are meta-prompts with no model or style/tone/context', () => {
        const logicals = d01Prompts.filter((d) => d.id !== 'SYS-D01-prompt-engineering');
        expect(logicals.length).toBe(5);
        for (const def of logicals) {
            expect(def.modeClass).toBe('chat-only-meta');
            expect(def.variantAxes).toEqual([]);
            expect(def.variants[0].isMetaPrompt).toBe(true);
            expect(def.variants[0].model).toBeNull();
            expect(def.variants[0].supports?.style).toBe(false);
            expect(def.variants[0].supports?.tone).toBe(false);
            expect(def.variants[0].supports?.context).toBe(false);
        }
    });

    it('all entries pass shape validation', () => {
        for (const def of d01Prompts) {
            validateDef(def);
        }
    });
});

describe('D02 Image Generation catalog module', () => {
    const validModelIds = new Set(MODELS.map((m) => m.id));

    it('exports 2 prompts (1 system + 1 logical)', () => {
        expect(d02Prompts.length).toBe(2);
    });

    it('LP-D02-generate-image has exactly 7 variants', () => {
        const lp = d02Prompts.find((d) => d.id === 'LP-D02-generate-image');
        expect(lp).toBeDefined();
        expect(lp!.variants.length).toBe(7);
    });

    it('all LP-D02-generate-image variants use valid MODELS ids', () => {
        const lp = d02Prompts.find((d) => d.id === 'LP-D02-generate-image')!;
        for (const v of lp.variants) {
            expect(v.model).not.toBeNull();
            expect(validModelIds.has(v.model!)).toBe(true);
        }
    });

    it('all entries pass shape validation', () => {
        for (const def of d02Prompts) {
            validateDef(def);
        }
    });
});

describe('D03 Image Editing catalog module', () => {
    const validModelIds = new Set(MODELS.map((m) => m.id));

    it('exports 11 prompts (1 system + 10 logical)', () => {
        expect(d03Prompts.length).toBe(11);
    });

    it('each of the 10 logical prompts has exactly 7 model variants', () => {
        const logicals = d03Prompts.filter((d) => !d.variants.some((v) => v.kind === 'system'));
        expect(logicals.length).toBe(10);
        for (const def of logicals) {
            expect(def.variants.length).toBe(7);
        }
    });

    it('all logical prompt variants use valid MODELS ids', () => {
        const logicals = d03Prompts.filter((d) => !d.variants.some((v) => v.kind === 'system'));
        for (const def of logicals) {
            for (const v of def.variants) {
                expect(v.model).not.toBeNull();
                expect(validModelIds.has(v.model!)).toBe(true);
            }
        }
    });

    it('LP-D03-restore-modernize is present', () => {
        const p = d03Prompts.find((d) => d.id === 'LP-D03-restore-modernize');
        expect(p).toBeDefined();
    });

    it('all entries pass shape validation', () => {
        for (const def of d03Prompts) {
            validateDef(def);
        }
    });
});

describe('D04 Diagrams catalog module', () => {
    it('exports 4 prompts (1 system + 3 logical)', () => {
        expect(d04Prompts.length).toBe(4);
    });

    it('LP-D04-mermaid is dual-mode with chat and agent variants', () => {
        const mermaid = d04Prompts.find((d) => d.id === 'LP-D04-mermaid');
        expect(mermaid).toBeDefined();
        expect(mermaid!.modeClass).toBe('dual');
        expect(mermaid!.variantAxes).toContain('mode');
        const contexts = mermaid!.variants.map((v) => v.executionContext);
        expect(contexts).toContain('chat');
        expect(contexts).toContain('agent');
    });

    it('LP-D04-drawio-build is dual-mode with chat and agent variants', () => {
        const drawioBuild = d04Prompts.find((d) => d.id === 'LP-D04-drawio-build');
        expect(drawioBuild).toBeDefined();
        expect(drawioBuild!.modeClass).toBe('dual');
        expect(drawioBuild!.variantAxes).toContain('mode');
        const contexts = drawioBuild!.variants.map((v) => v.executionContext);
        expect(contexts).toContain('chat');
        expect(contexts).toContain('agent');
    });

    it('LP-D04-drawio-explain is chat-only with no variantAxes', () => {
        const drawioExplain = d04Prompts.find((d) => d.id === 'LP-D04-drawio-explain');
        expect(drawioExplain).toBeDefined();
        expect(drawioExplain!.modeClass).toBe('chat-only');
        expect(drawioExplain!.variantAxes).toEqual([]);
    });

    it('all entries pass shape validation', () => {
        for (const def of d04Prompts) {
            validateDef(def);
        }
    });
});

describe('D05 Skill Authoring catalog module', () => {
    it('exports 3 prompts (1 system + 2 logical)', () => {
        expect(d05Prompts.length).toBe(3);
    });

    it('both logical prompts are meta-prompts with non-empty templates', () => {
        const logicals = d05Prompts.filter((d) => !d.variants.some((v) => v.kind === 'system'));
        expect(logicals.length).toBe(2);
        for (const def of logicals) {
            expect(def.variants[0].isMetaPrompt).toBe(true);
            expect(def.variants[0].template.length).toBeGreaterThan(0);
        }
    });

    it('LP-D05-build-lite-skill and LP-D05-build-full-skill are both present', () => {
        expect(d05Prompts.find((d) => d.id === 'LP-D05-build-lite-skill')).toBeDefined();
        expect(d05Prompts.find((d) => d.id === 'LP-D05-build-full-skill')).toBeDefined();
    });

    it('all entries pass shape validation', () => {
        for (const def of d05Prompts) {
            validateDef(def);
        }
    });
});

describe('D06 Video Generation catalog module', () => {
    const validModelIds = new Set(MODELS.map((m) => m.id));

    it('exports 2 prompts (1 system + 1 logical)', () => {
        expect(d06Prompts.length).toBe(2);
    });

    it('LP-D06-generate-video has exactly 13 model variants', () => {
        const lp = d06Prompts.find((d) => d.id === 'LP-D06-generate-video');
        expect(lp).toBeDefined();
        expect(lp!.variants.length).toBe(13);
    });

    it('all LP-D06-generate-video variants use valid MODELS ids', () => {
        const lp = d06Prompts.find((d) => d.id === 'LP-D06-generate-video')!;
        for (const v of lp.variants) {
            expect(v.model).not.toBeNull();
            expect(validModelIds.has(v.model!)).toBe(true);
        }
    });

    it('all entries pass shape validation', () => {
        for (const def of d06Prompts) {
            validateDef(def);
        }
    });
});

describe('Domain D barrel', () => {
    it('exports all 6 categories worth of prompts', () => {
        expect(dAllPrompts.length).toBeGreaterThan(25);
    });

    it('all logical IDs are unique across Domain D', () => {
        const ids = dAllPrompts.map((d) => d.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('all entries pass shape validation', () => {
        for (const def of dAllPrompts) {
            validateDef(def);
        }
    });
});
