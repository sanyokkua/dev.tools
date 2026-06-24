import { execSync } from 'child_process';
import path from 'path';

const ROOT = path.resolve(__dirname, '../..');

const BANNED_PATTERNS = [
    'ingest-prompts',
    'ingest:prompts',
    'content/prompts-collection',
    'prompts-data.json',
    'skills-data.json',
    'ingest/meta-categories',
    'ingest/model-names',
    'ingest/titles',
];

const SEARCH_DIRS = ['docs', 'CLAUDE.md', '.claude/skills'];

describe('Stale ingest/markdown term grep gate', () => {
    BANNED_PATTERNS.forEach((pattern) => {
        it(`"${pattern}" must not appear in docs or agent config`, () => {
            const targets = SEARCH_DIRS.join(' ');
            let output = '';
            try {
                output = execSync(`grep -r "${pattern}" ${targets} --include="*.md" -l 2>/dev/null`, {
                    cwd: ROOT,
                    encoding: 'utf-8',
                }).trim();
            } catch {
                output = ''; // grep exits 1 when nothing found — that's a pass
            }
            expect(output).toBe('');
        });
    });
});
