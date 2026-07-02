// Guards against hardcoded personal-machine paths (a specific developer's home
// directory) leaking into shipped source, scripts, docs, tests, or public assets —
// e.g. `/Users/ok/...`, `/home/johndoe/...`, `C:\Users\jdoe\...`. Command strings
// containing these break for every user except the one whose machine they were
// copy-pasted from.
//
// Does NOT flag portable forms (~/, $HOME/, %USERPROFILE%\) or legitimate
// multi-user system paths (/usr/local/..., /opt/homebrew/..., /home/linuxbrew/...).
//
// Usage:
//   node scripts/check-hardcoded-paths.mjs [--src <dir>]...
//
// With no --src, scans the default roots below. Each --src may be repeated to
// scan multiple directories (used by tests to point at isolated fixtures).
// Exits 1 if any non-allowlisted match is found; exits 0 otherwise.
//
// Wired as:  npm run check:paths (part of npm run verify)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// ── CLI args ──────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
function getArgs(flag) {
    return argv.reduce((acc, val, i) => (val === flag ? [...acc, argv[i + 1]] : acc), []);
}
const srcRoots = getArgs('--src');
const ROOTS = srcRoots.length > 0 ? srcRoots : ['src', 'scripts', 'docs', 'test', 'public'];

// ── Scan configuration ───────────────────────────────────────────────────────
const SKIP_DIRS = new Set(['node_modules', '.next', 'out', 'coverage']);
// Directories that legitimately contain example/historical personal-path strings
// and are not shipped/executed content: the temporary feature-spec folder (will
// be deleted independently of this guard), synthetic test fixtures, and the
// prompts/skills catalog (authored instructional prose bundled as TS string
// data — e.g. a Mermaid escaping guide illustrating `C:\Users\data` as a
// generic example — not generated install/command strings).
const EXCLUDED_SUBPATHS = ['docs/dev-tools-feature-spec', 'test/fixtures', 'src/common/prompts'];
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.json', '.mjs', '.js', '.md']);

// Non-personal path segments that happen to match the personal-path shapes below
// (fixed, documented multi-user/system install conventions, not per-user paths).
const ALLOWLISTED_SEGMENTS = new Set(['linuxbrew', 'Shared']);

// The Windows pattern allows 1–2 backslashes on each side: a raw shell/PowerShell
// string has one literal backslash, but the same path escaped inside a JS/TS
// template literal or double-quoted string is written with two.
const PATTERNS = [
    /\/Users\/([A-Za-z0-9_.-]+)/g,
    /\/home\/([A-Za-z0-9_.-]+)/g,
    /C:\\{1,2}Users\\{1,2}([A-Za-z0-9_.-]+)/g,
];

// ── File discovery ───────────────────────────────────────────────────────────
// EXCLUDED_SUBPATHS only applies to the default scan roots — a caller passing an
// explicit --src (e.g. this script's own tests, pointing at fixtures nested under
// test/fixtures/) is opting into scanning exactly that directory, unfiltered.
const applyExclusions = srcRoots.length === 0;

function isExcluded(relPath) {
    return applyExclusions && EXCLUDED_SUBPATHS.some((sub) => relPath === sub || relPath.startsWith(sub + '/'));
}

function walk(dir, cwd, files) {
    let entries;
    try {
        entries = readdirSync(dir, { withFileTypes: true });
    } catch {
        return files;
    }
    for (const entry of entries) {
        const full = join(dir, entry.name);
        const relPath = relative(cwd, full);
        if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
        if (isExcluded(relPath)) continue;
        if (entry.isDirectory()) {
            walk(full, cwd, files);
        } else if (SCAN_EXTENSIONS.has(entry.name.slice(entry.name.lastIndexOf('.')))) {
            files.push(full);
        }
    }
    return files;
}

const cwd = process.cwd();
const files = ROOTS.flatMap((root) => {
    let rootStat;
    try {
        rootStat = statSync(root);
    } catch {
        return [];
    }
    return rootStat.isDirectory() ? walk(root, cwd, []) : [root];
});

// ── Detection ─────────────────────────────────────────────────────────────────
const findings = [];
for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('//')) return; // allowlisted comment
        for (const pattern of PATTERNS) {
            pattern.lastIndex = 0;
            let match;
            while ((match = pattern.exec(line)) !== null) {
                const segment = match[1];
                if (ALLOWLISTED_SEGMENTS.has(segment)) continue;
                findings.push({ file, line: i + 1, content: trimmed });
            }
        }
    });
}

if (findings.length > 0) {
    console.error(`Found ${findings.length} hardcoded personal-path occurrence(s):`);
    findings.forEach((f) => console.error(`  ${f.file}:${f.line}  ${f.content}`));
    process.exit(1);
}
console.log(`check:paths OK — scanned ${files.length} file(s), no hardcoded personal paths found.`);
