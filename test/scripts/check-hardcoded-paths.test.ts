import { execSync } from 'child_process';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '../..');
const SCRIPT = 'node scripts/check-hardcoded-paths.mjs';
const FIXTURES = 'test/fixtures/check-hardcoded-paths';

function run(args: string): string {
    return execSync(`${SCRIPT} ${args}`, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' });
}

function runExpectFail(args: string): boolean {
    try {
        run(args);
        return false;
    } catch {
        return true;
    }
}

describe('check-hardcoded-paths — flags personal-path shapes', () => {
    it('flags /Users/<name>/...', () => expect(runExpectFail(`--src "${FIXTURES}/bad-users"`)).toBe(true));
    it('flags /home/<name>/...', () => expect(runExpectFail(`--src "${FIXTURES}/bad-home"`)).toBe(true));
    it('flags C:\\Users\\<name>\\...', () => expect(runExpectFail(`--src "${FIXTURES}/bad-windows"`)).toBe(true));
});

describe('check-hardcoded-paths — allows portable and legitimate paths', () => {
    it('passes on portable forms and allowlisted system/legitimate paths', () => {
        const output = run(`--src "${FIXTURES}/good"`);
        expect(output).toContain('OK');
    });

    it('does not flag a match inside a // comment', () => {
        const output = run(`--src "${FIXTURES}/good-comment"`);
        expect(output).toContain('OK');
    });
});

describe('check-hardcoded-paths — real repo self-check', () => {
    it('the current repo (default scan roots, minus exclusions) is clean', () => {
        const output = run('');
        expect(output).toContain('OK');
    });
});
