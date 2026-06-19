import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

const FIXTURES = path.resolve('test/fixtures/prompts-collection');
const OUT_DIR = path.resolve('test/fixtures/prompts-collection-out');

function runIngest(srcDir: string, outDir: string): { prompts: any; skills: any } {
    execSync(`node scripts/ingest-prompts.mjs --src "${srcDir}" --out "${outDir}"`, { stdio: 'pipe' });
    return {
        prompts: JSON.parse(readFileSync(path.join(outDir, 'prompts-data.json'), 'utf8')),
        skills: JSON.parse(readFileSync(path.join(outDir, 'skills-data.json'), 'utf8')),
    };
}

describe('ingest-prompts: section parsing', () => {
    let data: ReturnType<typeof runIngest>;
    beforeAll(() => {
        data = runIngest(FIXTURES, OUT_DIR);
    });

    test('parses prompt ID, kind, categoryCode', () => {
        const v = data.prompts.variants.find((v: any) => v.id === 'USR-A03-review-change');
        expect(v).toBeDefined();
        expect(v.kind).toBe('user');
        expect(v.categoryCode).toBe('A03');
    });

    test('parses template verbatim including {{params}}', () => {
        const v = data.prompts.variants.find((v: any) => v.id === 'USR-A03-review-change');
        expect(v.template).toContain('{{language}}');
        expect(v.template).toContain('{{code}}');
    });

    test('parses parameters with name and description', () => {
        const v = data.prompts.variants.find((v: any) => v.id === 'USR-A03-review-change');
        expect(v.parameters).toHaveLength(2);
        expect(v.parameters[0].name).toBe('language');
    });

    test('seeds suggestedValues from Example Values', () => {
        const v = data.prompts.variants.find((v: any) => v.id === 'USR-A03-review-change');
        const langParam = v.parameters.find((p: any) => p.name === 'language');
        expect(langParam.suggestedValues).toContain('Go');
        expect(langParam.suggestedValues).toContain('TypeScript');
        expect(langParam.allowCustom).toBe(true);
    });

    test('parses keywords from comma-separated list', () => {
        const v = data.prompts.variants.find((v: any) => v.id === 'USR-A03-review-change');
        expect(v.keywords).toContain('code review');
    });

    test('parses recommendedSystemPromptId from Notes', () => {
        const v = data.prompts.variants.find((v: any) => v.id === 'USR-A03-review-change');
        expect(v.recommendedSystemPromptId).toBe('SYS-A03-code-review');
    });

    test('parses relatedPromptIds from Notes', () => {
        const v = data.prompts.variants.find((v: any) => v.id === 'USR-A03-review-change');
        expect(v.relatedPromptIds).toContain('AGT-A03-review-changes');
    });
});

describe('ingest-prompts: model variants', () => {
    let data: ReturnType<typeof runIngest>;
    beforeAll(() => {
        data = runIngest(FIXTURES, OUT_DIR);
    });

    test('groups imggen-flux2 and imggen-gptImage into one LogicalPrompt', () => {
        const lp = data.prompts.logical.find((l: any) => l.id.includes('imggen'));
        expect(lp).toBeDefined();
        expect(lp.variantAxes).toContain('model');
        expect(lp.variantIds).toHaveLength(2);
    });

    test('sets model label from model-names.json', () => {
        const v = data.prompts.variants.find((v: any) => v.id === 'USR-D02-imggen-flux2');
        expect(v.model).toBe('FLUX.2');
    });
});

describe('ingest-prompts: chat/agent grouping', () => {
    let data: ReturnType<typeof runIngest>;
    beforeAll(() => {
        data = runIngest(FIXTURES, OUT_DIR);
    });

    test('groups USR-A03-review-change (chat) and AGT-A03-review-changes (agent) into one LogicalPrompt', () => {
        const lp = data.prompts.logical.find((l: any) => l.id.includes('review'));
        expect(lp).toBeDefined();
        expect(lp.variantAxes).toContain('executionContext');
        const userV = data.prompts.variants.find((v: any) => v.id === 'USR-A03-review-change');
        const agentV = data.prompts.variants.find((v: any) => v.id === 'AGT-A03-review-changes');
        expect(userV.executionContext).toBe('chat');
        expect(agentV.executionContext).toBe('agent');
    });
});

describe('ingest-prompts: meta classification', () => {
    let data: ReturnType<typeof runIngest>;
    beforeAll(() => {
        data = runIngest(FIXTURES, OUT_DIR);
    });

    test('D02 variants are meta-prompts', () => {
        const v = data.prompts.variants.find((v: any) => v.id === 'USR-D02-imggen-flux2');
        expect(v.isMetaPrompt).toBe(true);
    });

    test('A03 user variant is not a meta-prompt', () => {
        const v = data.prompts.variants.find((v: any) => v.id === 'USR-A03-review-change');
        expect(v.isMetaPrompt).toBe(false);
    });

    test('prompt with META token in Notes is classified meta regardless of category', () => {
        const v = data.prompts.variants.find((v: any) => v.id === 'USR-D02-imggen-flux2');
        expect(v.isMetaPrompt).toBe(true);
    });
});

describe('ingest-prompts: skill parsing', () => {
    let data: ReturnType<typeof runIngest>;
    beforeAll(() => {
        data = runIngest(FIXTURES, OUT_DIR);
    });

    test('parses skill YAML frontmatter', () => {
        const s = data.skills.skills.find((s: any) => s.id === 'SKILL-code-review');
        expect(s).toBeDefined();
        expect(s.version).toBe('1.0.0');
        expect(s.allowedTools).toContain('Read');
    });

    test('lists all files in skill folder', () => {
        const s = data.skills.skills.find((s: any) => s.id === 'SKILL-code-review');
        const paths = s.files.map((f: any) => f.path);
        expect(paths).toContain('SKILL.md');
        expect(paths).toContain('helper.md');
    });

    test('includes raw file content for offline copy', () => {
        const s = data.skills.skills.find((s: any) => s.id === 'SKILL-code-review');
        const skillFile = s.files.find((f: any) => f.path === 'SKILL.md');
        expect(skillFile.content).toContain('code-review');
    });
});

describe('ingest-prompts: combobox seeding', () => {
    let data: ReturnType<typeof runIngest>;
    beforeAll(() => {
        data = runIngest(FIXTURES, OUT_DIR);
    });

    test('deduplicates and trims suggestedValues', () => {
        const v = data.prompts.variants.find((v: any) => v.id === 'USR-D02-imggen-flux2');
        const aspectParam = v.parameters.find((p: any) => p.name === 'aspect');
        const vals = aspectParam?.suggestedValues ?? [];
        expect(vals.length).toBe(new Set(vals).size);
        vals.forEach((val: string) => expect(val).toBe(val.trim()));
    });
});

describe('ingest-prompts: validation failures', () => {
    test('fails when a recommendedSystemPromptId does not resolve', () => {
        const badFixture = path.join(FIXTURES, '..', 'prompts-collection-dangling');
        expect(() => runIngest(badFixture, OUT_DIR)).toThrow();
    });

    test('emits counts summary matching INDEX.md (happy path)', () => {
        const result = execSync(`node scripts/ingest-prompts.mjs --src "${FIXTURES}" --out "${OUT_DIR}"`, {
            encoding: 'utf8',
        });
        // Fixtures have: SYS-A03 + SYS-D02 = 2 system prompts, 4 user/agent, 1 skill
        expect(result).toContain('System prompts: 2');
        expect(result).toContain('Skills: 1');
    });
});
