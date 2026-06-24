#!/usr/bin/env node
/**
 * One-off converter: reads skill directories from the library and emits typed TypeScript
 * skill.ts files under src/common/prompts/skills/<slug>/skill.ts
 *
 * Usage:
 *   node scripts/oneoff/build-skill-modules.mjs \
 *     --library .tmp/Specification/library \
 *     --out src/common/prompts/skills
 */

import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(flag) {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : null;
}
const libraryDir = getArg('--library') ?? '.tmp/Specification/library';
const outDir = getArg('--out') ?? 'src/common/prompts/skills';
const skillsDir = join(libraryDir, 'skills');

// ── Domain code mapping ───────────────────────────────────────────────────────
const DOMAIN_MAP = { 'drawio': 'D', 'mermaid': 'D', 'skill-builder': 'D' };
function domainCode(slug) {
    return DOMAIN_MAP[slug] ?? 'A';
}

// ── Simple YAML frontmatter parser ───────────────────────────────────────────
function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) throw new Error('No YAML frontmatter found');
    const yamlText = match[1];
    const body = match[2].trimStart();

    const meta = {};
    const lines = yamlText.split('\n');
    let i = 0;

    function parseValue(raw) {
        raw = raw.trim();
        // Inline list: [a, b, c]
        if (raw.startsWith('[') && raw.endsWith(']')) {
            return raw
                .slice(1, -1)
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
        }
        // Multi-line string (>) — handled at call site
        if (raw === '>') return null; // signals multiline
        return raw;
    }

    while (i < lines.length) {
        const line = lines[i];
        // Skip empty lines and comments
        if (!line.trim() || line.trim().startsWith('#')) {
            i++;
            continue;
        }
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) {
            i++;
            continue;
        }
        const key = line.slice(0, colonIdx).trim();
        const rest = line.slice(colonIdx + 1).trim();

        if (rest === '>') {
            // Multi-line folded string: collect indented lines
            const indentLines = [];
            i++;
            while (i < lines.length && (lines[i].startsWith('  ') || lines[i].trim() === '')) {
                indentLines.push(lines[i].trim());
                i++;
            }
            meta[key] = indentLines.join(' ').trim();
        } else if (rest === '') {
            // Check if next lines are list items (-) or nested key:value
            const items = [];
            const nested = {};
            let isNested = false;
            i++;
            while (i < lines.length && (lines[i].startsWith('  ') || lines[i].startsWith('    '))) {
                const inner = lines[i].trim();
                if (inner.startsWith('- ')) {
                    // List item
                    const val = inner.slice(2).trim();
                    // Check if it's a key: description map item
                    const innerColon = val.indexOf(':');
                    if (innerColon !== -1) {
                        // It's a mapping like "project-navigator: reason text"
                        items.push(val.slice(0, innerColon).trim());
                    } else {
                        items.push(val);
                    }
                } else {
                    // Nested key: value
                    isNested = true;
                    const nestedColon = inner.indexOf(':');
                    if (nestedColon !== -1) {
                        const nk = inner.slice(0, nestedColon).trim();
                        const nv = inner.slice(nestedColon + 1).trim();
                        if (nv === 'true') nested[nk] = true;
                        else if (nv === 'false') nested[nk] = false;
                        else nested[nk] = nv;
                    }
                }
                i++;
            }
            meta[key] = isNested ? nested : items;
        } else {
            meta[key] = parseValue(rest);
            i++;
        }
    }

    return { meta, body };
}

// ── File reading helpers ──────────────────────────────────────────────────────
function readFile(filePath) {
    try {
        return readFileSync(filePath, 'utf8');
    } catch {
        return null;
    }
}

function collectSkillFiles(skillDir, meta) {
    const files = [];

    // 1. SKILL.md itself as the 'skill' role
    const skillMd = readFileSync(join(skillDir, 'SKILL.md'), 'utf8');
    files.push({ path: 'SKILL.md', role: 'skill', content: skillMd, bytes: Buffer.byteLength(skillMd, 'utf8') });

    // 2. References
    for (const ref of meta.references ?? []) {
        const content = readFile(join(skillDir, ref));
        if (content != null) {
            files.push({ path: ref, role: 'reference', content, bytes: Buffer.byteLength(content, 'utf8') });
        }
    }

    // 3. Scripts
    for (const script of meta.scripts ?? []) {
        const content = readFile(join(skillDir, script));
        if (content != null) {
            files.push({ path: script, role: 'script', content, bytes: Buffer.byteLength(content, 'utf8') });
        }
    }

    // 4. Assets
    for (const asset of meta.assets ?? []) {
        const content = readFile(join(skillDir, asset));
        if (content != null) {
            files.push({ path: asset, role: 'asset', content, bytes: Buffer.byteLength(content, 'utf8') });
        }
    }

    return files;
}

function tsArr(arr) {
    if (arr.length === 0) return '[]';
    return `[\n        ${arr.map((s) => JSON.stringify(s)).join(', ')},\n    ]`;
}

function tsFilesArr(files) {
    const parts = files.map((f) => {
        return `        {
            path: ${JSON.stringify(f.path)},
            role: ${JSON.stringify(f.role)},
            content: ${JSON.stringify(f.content)},
            bytes: ${f.bytes},
        }`;
    });
    return `[\n${parts.join(',\n')},\n    ]`;
}

// ── Emit a single skill.ts ────────────────────────────────────────────────────
function emitSkillTs(slug, meta, files, relatedSkillIds) {
    const id = `SKILL-${slug}`;
    const code = domainCode(slug);
    const allowedTools = Array.isArray(meta['allowed-tools'])
        ? meta['allowed-tools']
        : (meta['allowed-tools'] ?? '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
    const tags = Array.isArray(meta.tags) ? meta.tags : [];

    const installBlock = meta.install
        ? `,
    install: {
        defaultLocation: ${JSON.stringify(meta.install.defaultLocation ?? `.claude/skills/${slug}/`)},
        supportsProject: ${meta.install.supportsProject === 'true' ? 'true' : meta.install.supportsProject === true ? 'true' : 'false'},
        supportsGlobal: ${meta.install.supportsGlobal === 'true' ? 'true' : meta.install.supportsGlobal === true ? 'true' : 'false'},
    }`
        : '';

    return `import type { SkillDef } from '../../model/types.js';

export const skill: SkillDef = {
    id: ${JSON.stringify(id)},
    slug: ${JSON.stringify(slug)},
    domainCode: ${JSON.stringify(code)},
    title: ${JSON.stringify(meta.title ?? slug)},
    version: ${JSON.stringify(meta.version ?? '1.0.0')},
    description: ${JSON.stringify(meta.description ?? '')},
    tags: ${tsArr(tags)},
    allowedTools: ${tsArr(allowedTools)},
    relatedSkillIds: ${tsArr(relatedSkillIds)},
    files: ${tsFilesArr(files)}${installBlock},
};
`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const slugs = readdirSync(skillsDir)
    .filter((name) => {
        try {
            return statSync(join(skillsDir, name)).isDirectory();
        } catch {
            return false;
        }
    })
    .sort();

console.log(`[build-skill-modules] Found ${slugs.length} skills: ${slugs.join(', ')}`);

const processed = [];

for (const slug of slugs) {
    const skillDir = join(skillsDir, slug);
    const skillMdPath = join(skillDir, 'SKILL.md');
    const content = readFile(skillMdPath);
    if (!content) {
        console.warn(`  [skip] ${slug}: no SKILL.md`);
        continue;
    }

    let meta;
    try {
        ({ meta } = parseFrontmatter(content));
    } catch (e) {
        console.error(`  [error] ${slug}: ${e.message}`);
        continue;
    }

    // Collect related skill IDs from related-skills list
    const relatedSlugsList = Array.isArray(meta['related-skills']) ? meta['related-skills'] : [];
    const relatedSkillIds = relatedSlugsList.map((s) => `SKILL-${s}`);

    // Collect files
    const files = collectSkillFiles(skillDir, meta);

    // Emit skill.ts
    const skillOutDir = join(outDir, slug);
    mkdirSync(skillOutDir, { recursive: true });
    const tsContent = emitSkillTs(slug, meta, files, relatedSkillIds);
    writeFileSync(join(skillOutDir, 'skill.ts'), tsContent, 'utf8');
    console.log(`  [ok] ${slug} → skills/${slug}/skill.ts (${files.length} files)`);
    processed.push(slug);
}

// Emit index.ts barrel
const imports = processed.map((slug) => {
    const varName = slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) + 'Skill';
    return `import { skill as ${varName} } from './${slug}/skill.js';`;
});
const exportArr = processed.map((slug) => {
    const varName = slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) + 'Skill';
    return `    ${varName}`;
});

const indexContent = `import type { SkillDef } from '../model/types.js';

${imports.join('\n')}

export const skills: SkillDef[] = [
${exportArr.join(',\n')},
];
`;

writeFileSync(join(outDir, 'index.ts'), indexContent, 'utf8');
console.log(`[build-skill-modules] Wrote skills/index.ts (${processed.length} skills)`);
console.log(`[build-skill-modules] Done.`);
