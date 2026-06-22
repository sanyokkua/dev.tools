import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

const ROOT = resolve(__dirname, '../..');
const SCRIPT = 'node scripts/build-prompts.mjs';
const FIXTURES = 'test/fixtures/build-prompts-src';

function run(fixtureName: string, outDir: string) {
    return execSync(`${SCRIPT} --src "${FIXTURES}/${fixtureName}" --out "${outDir}"`, {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: 'pipe',
    });
}

function runExpectFail(fixtureName: string, outDir: string): boolean {
    try {
        execSync(`${SCRIPT} --src "${FIXTURES}/${fixtureName}" --out "${outDir}"`, {
            cwd: ROOT,
            encoding: 'utf8',
            stdio: 'pipe',
        });
        return false;
    } catch {
        return true;
    }
}

function tempOut(): string {
    const dir = join(tmpdir(), `bptest-${Math.random().toString(36).slice(2)}`);
    mkdirSync(dir, { recursive: true });
    return dir;
}

describe('build-prompts — happy path', () => {
    let out: string;
    let manifest: string;
    let loaders: string;

    beforeAll(() => {
        out = tempOut();
        run('catalog-happy', out);
        manifest = readFileSync(join(out, 'manifest.generated.ts'), 'utf8');
        loaders = readFileSync(join(out, 'loaders.generated.ts'), 'utf8');
    });

    afterAll(() => rmSync(out, { recursive: true, force: true }));

    it('emits manifest.generated.ts', () => expect(existsSync(join(out, 'manifest.generated.ts'))).toBe(true));
    it('emits loaders.generated.ts', () => expect(existsSync(join(out, 'loaders.generated.ts'))).toBe(true));
    it('manifest contains export const MANIFEST', () => expect(manifest).toContain('export const MANIFEST'));
    it('manifest contains logical prompt id', () => expect(manifest).toContain('LP-A01-sql-query'));
    it('manifest contains skill id', () => expect(manifest).toContain('SKILL-code-review'));
    it('loaders contains category loader', () => expect(loaders).toContain('"A01"'));
    it('loaders contains correct catalog import path', () =>
        expect(loaders).toContain('./catalog/a-software-engineering/a01-code-generation'));
    it('loaders contains skill loader', () => expect(loaders).toContain('./skills/code-review/skill'));
});

describe('build-prompts — empty catalog (absent src)', () => {
    let out: string;

    beforeAll(() => {
        out = tempOut();
        execSync(`${SCRIPT} --out "${out}"`, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' });
    });

    afterAll(() => rmSync(out, { recursive: true, force: true }));

    it('emits empty manifest.generated.ts', () => {
        const content = readFileSync(join(out, 'manifest.generated.ts'), 'utf8');
        expect(content).toContain('logical: []');
    });
    it('emits empty loaders.generated.ts', () => {
        const content = readFileSync(join(out, 'loaders.generated.ts'), 'utf8');
        expect(content).toContain('CATEGORY_LOADERS');
    });
});

describe('build-prompts — validator invariants', () => {
    it('V1 duplicate logical id → exit 1', () => expect(runExpectFail('catalog-bad-dup-id', tempOut())).toBe(true));
    it('V3 dangling defaultVariantId → exit 1', () =>
        expect(runExpectFail('catalog-bad-dangling-default', tempOut())).toBe(true));
    it('V4 dangling recommendedSystemPromptId → exit 1', () =>
        expect(runExpectFail('catalog-bad-dangling-ref', tempOut())).toBe(true));
    it('V6 dangling relatedSkillId → exit 1', () =>
        expect(runExpectFail('catalog-bad-dangling-skill-ref', tempOut())).toBe(true));
    it('V8 undeclared {{param}} in template → exit 1', () =>
        expect(runExpectFail('catalog-bad-undeclared-param', tempOut())).toBe(true));
    it('V9 unused declared param → exit 1', () =>
        expect(runExpectFail('catalog-bad-unused-param', tempOut())).toBe(true));
    it('V7 unknown model id → exit 1', () => expect(runExpectFail('catalog-bad-unknown-model', tempOut())).toBe(true));
    it('V12 snake_case title → exit 1', () => expect(runExpectFail('catalog-bad-slug-title', tempOut())).toBe(true));
    it('V12 camelCase title → exit 1', () => expect(runExpectFail('catalog-bad-camel-title', tempOut())).toBe(true));
    it('V13 bare abbreviation in title → exit 1', () =>
        expect(runExpectFail('catalog-bad-abbr-title', tempOut())).toBe(true));
    it('V13 bare abbreviation in description → exit 1', () =>
        expect(runExpectFail('catalog-bad-abbr-desc', tempOut())).toBe(true));
    it('V10 invalid param.control → exit 1', () =>
        expect(runExpectFail('catalog-bad-invalid-control', tempOut())).toBe(true));
});
