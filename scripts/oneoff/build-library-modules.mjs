#!/usr/bin/env node
// One-off converter: library markdown → TypeScript catalog modules
// Run with:
//   node --loader ts-node/esm --no-warnings scripts/oneoff/build-library-modules.mjs \
//     --domain a-software-engineering \
//     --library .tmp/Specification/library \
//     --out src/common/prompts/catalog

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import yaml from 'yaml';

// ── CLI args ──────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
function getArg(flag) {
    const i = argv.indexOf(flag);
    return i !== -1 ? argv[i + 1] : null;
}
const domainArg = getArg('--domain');
const libraryArg = getArg('--library');
const outArg = getArg('--out');

if (!domainArg || !libraryArg || !outArg) {
    console.error('Usage: node build-library-modules.mjs --domain <slug> --library <path> --out <path>');
    process.exit(1);
}

const libraryDir = resolve(process.cwd(), libraryArg);
const catalogOutDir = resolve(process.cwd(), outArg);
const domainOutDir = join(catalogOutDir, domainArg);
const contentDir = join(libraryDir, 'content', domainArg);

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseFrontmatter(lines) {
    const fm = {};
    for (const line of lines) {
        if (!line.trim() || line.startsWith('#')) continue;
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;
        const key = line.slice(0, colonIdx).trim();
        const valStr = line.slice(colonIdx + 1).trim();

        switch (key) {
            case 'related': {
                const inner = valStr.replace(/^\[/, '').replace(/\]$/, '').trim();
                fm[key] = inner ? inner.split(/\s*,\s*/).filter(Boolean) : [];
                break;
            }
            case 'supports': {
                const supObj = {};
                for (const m of valStr.matchAll(/(\w+):\s*(true|false)/g)) {
                    supObj[m[1]] = m[2] === 'true';
                }
                fm[key] = supObj;
                break;
            }
            case 'isMetaPrompt':
                fm[key] = valStr === 'true';
                break;
            default:
                if (valStr === 'null') fm[key] = null;
                else if (valStr === 'true') fm[key] = true;
                else if (valStr === 'false') fm[key] = false;
                else fm[key] = valStr || null;
        }
    }
    return fm;
}

function extractSharedTemplate(content) {
    // Find a fenced code block in the file header (before any ### heading)
    const firstHeadingIdx = content.indexOf('\n### ');
    const header = firstHeadingIdx !== -1 ? content.slice(0, firstHeadingIdx) : content;
    const match = header.match(/```\n([\s\S]+?)\n```/);
    return match ? match[1] : null;
}

function parseEntry(sectionText, sharedTemplate) {
    const lines = sectionText.split('\n');
    const headerIdx = lines.findIndex((l) => l.startsWith('### '));
    if (headerIdx === -1) return null;
    const id = lines[headerIdx].slice(4).trim();
    if (!id) return null;

    // Find variant: lines at column 0
    const variantIndices = [];
    for (let i = headerIdx + 1; i < lines.length; i++) {
        if (lines[i] === 'variant:') variantIndices.push(i);
    }

    // Frontmatter: lines between header and first variant
    const fmEnd = variantIndices.length > 0 ? variantIndices[0] : lines.length;
    const fmLines = lines.slice(headerIdx + 1, fmEnd).filter((l) => l.trim());
    const fm = parseFrontmatter(fmLines);

    // Variant blocks: each from a 'variant:' line to the next
    const variants = [];
    for (let i = 0; i < variantIndices.length; i++) {
        const start = variantIndices[i];
        const end = i + 1 < variantIndices.length ? variantIndices[i + 1] : lines.length;
        // Strip 'notes:' and its continuation lines — we don't use it and it may contain
        // unquoted colons that confuse the YAML parser in some contexts.
        const blockLines = lines.slice(start, end);
        const filteredLines = [];
        let skipNote = false;
        for (const bl of blockLines) {
            if (/^  notes:/.test(bl)) {
                skipNote = true;
                continue;
            }
            if (skipNote && (bl.startsWith('    ') || bl.trim() === '')) continue;
            skipNote = false;
            filteredLines.push(bl);
        }
        // Strip --- section separators: they appear at the end of context entries and
        // cause yaml.parse() to report "multiple documents".
        const block = filteredLines.join('\n').split('\n---\n')[0];
        try {
            const parsed = yaml.parse(block);
            if (parsed && parsed.variant) {
                const v = parsed.variant;
                // Expand shared template reference (used in b-communication-contexts.md)
                if (sharedTemplate && typeof v.template === 'string' && v.template.startsWith('(shared context core')) {
                    v.template = sharedTemplate;
                }
                variants.push(v);
            }
        } catch (e) {
            console.error(`  [YAML error] ${id} variant block ${i}: ${e.message}`);
        }
    }

    // If no variant: blocks found, try to extract a top-level template (B domain SYS format).
    // These entries store the template as a YAML block scalar directly in the frontmatter.
    if (variants.length === 0) {
        // Re-parse the full section as YAML (excluding the ### heading line).
        const sectionWithoutHeading = lines
            .slice(headerIdx + 1)
            .join('\n')
            .split('\n---\n')[0];
        try {
            const parsed = yaml.parse(sectionWithoutHeading);
            if (parsed && typeof parsed.template === 'string' && parsed.template.length > 10) {
                // Parse keywords array from simple frontmatter (the YAML parser already has it)
                const kws = Array.isArray(parsed.keywords) ? parsed.keywords : [];
                variants.push({
                    id,
                    kind: parsed.kind || 'system',
                    mode: parsed.mode || 'chat',
                    template: parsed.template,
                    keywords: kws,
                    parameters: [],
                    model: null,
                });
            }
        } catch {
            // Not valid YAML — skip
        }
    }

    return { id, ...fm, variants };
}

function parseMarkdownFile(filePath) {
    const content = readFileSync(filePath, 'utf8');
    const sharedTemplate = extractSharedTemplate(content);

    // Split at each unindented ### heading so each entry is its own section.
    // Handles both A/C format (--- separators) and B format (no --- between entries).
    const lines = content.split('\n');
    const sections = [];
    let current = [];
    for (const line of lines) {
        if (line.startsWith('### ') && current.length > 0) {
            // Trim trailing --- separators before closing the section
            while (
                current.length > 0 &&
                (current[current.length - 1] === '---' || current[current.length - 1].trim() === '')
            ) {
                current.pop();
            }
            sections.push(current.join('\n'));
            current = [line];
        } else {
            current.push(line);
        }
    }
    if (current.length > 0) sections.push(current.join('\n'));

    const entries = [];
    for (const section of sections) {
        if (!section.includes('### ')) continue;
        const entry = parseEntry(section, sharedTemplate);
        if (entry && entry.id) entries.push(entry);
    }
    return entries;
}

// ── Category / filename derivation ────────────────────────────────────────────

function categoryFromFilename(filename) {
    // a01-code-generation.md → { code: 'A01', slug: 'code-generation' }
    const base = filename.replace(/\.md$/, '');
    const dashIdx = base.indexOf('-');
    const codeStr = base.slice(0, dashIdx); // 'a01'
    const slug = base.slice(dashIdx + 1); // 'code-generation'
    const code = codeStr.toUpperCase(); // 'A01'
    return { code, slug };
}

function isSystemEntry(entry) {
    return (
        entry.id.startsWith('SYS-') ||
        entry.modeClass === 'chat-only-meta' ||
        (entry.variants.length > 0 && entry.variants[0].kind === 'system')
    );
}

function slugFromId(id, isSys) {
    if (isSys) return 'sys';
    // LP-A01-function → function; LP-A01-from-spec → from-spec
    const parts = id.split('-');
    return parts.slice(2).join('-');
}

// ── ID filtering ──────────────────────────────────────────────────────────────
const INCLUDE_PREFIXES = ['LP-A', 'SYS-A', 'AGT-A', 'LP-B', 'SYS-B', 'AGT-B', 'LP-C', 'SYS-C', 'AGT-C'];

// Correct known ID mismatches between library source and generated catalog
const RELATED_ID_CORRECTIONS = { 'LP-B-context-message': 'LP-B-context-write' };

function filterRelatedIds(related) {
    if (!Array.isArray(related)) return [];
    return related
        .map((ref) => RELATED_ID_CORRECTIONS[ref] || ref)
        .filter((ref) => INCLUDE_PREFIXES.some((p) => ref.startsWith(p)));
}

// ── TypeScript serialization ──────────────────────────────────────────────────

function serializeString(s) {
    if (s == null) return 'null';
    if (s.includes('\n') || s.includes('`')) {
        const escaped = s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
        return `\`${escaped}\``;
    }
    return JSON.stringify(s);
}

function serializeValue(val, indent = 0) {
    if (val === null || val === undefined) return 'null';
    if (typeof val === 'boolean') return String(val);
    if (typeof val === 'number') return String(val);
    if (typeof val === 'string') return serializeString(val);

    const pad = '    '.repeat(indent);
    const pad1 = '    '.repeat(indent + 1);

    if (Array.isArray(val)) {
        if (val.length === 0) return '[]';
        const items = val.map((x) => serializeValue(x, indent + 1));
        if (items.every((x) => !x.includes('\n')) && items.join(', ').length < 60) {
            return `[${items.join(', ')}]`;
        }
        return `[\n${items.map((x) => `${pad1}${x}`).join(',\n')},\n${pad}]`;
    }

    if (typeof val === 'object') {
        const entries = Object.entries(val).filter(([, v]) => v !== undefined);
        if (entries.length === 0) return '{}';
        const lines = entries.map(([k, v]) => `${pad1}${k}: ${serializeValue(v, indent + 1)}`);
        return `{\n${lines.join(',\n')},\n${pad}}`;
    }

    return String(val);
}

// Map library valueSet IDs that don't match our registry to correct ones
const VALUE_SET_ID_MAP = { 'tone-id': 'tone', 'style-id': 'style', 'context-id': 'context' };

// Replace [[INJECT_RULES]] with the appropriate {{param}} token(s) based on declared params
function resolveInjectRules(template, parameters) {
    if (!template.includes('[[INJECT_RULES]]')) return template;
    const paramNames = (parameters || []).map((p) => p.name);
    const injectionParts = [];
    if (paramNames.includes('style')) injectionParts.push('{{style}}');
    if (paramNames.includes('tone')) injectionParts.push('{{tone}}');
    if (paramNames.includes('context')) injectionParts.push('{{context}}');
    const replacement = injectionParts.length > 0 ? injectionParts.join('\n\n') : '{{injectedRules}}';
    return template.replace('[[INJECT_RULES]]', replacement);
}

// Expand known abbreviations that the V13 lint requires spelled out on first use.
// Replace TL;DR (with any optional following parenthetical) so the full form always appears.
function expandAbbreviations(text) {
    if (!text) return text;
    return text
        .replace(/\bTL;DR\b(?:\s*\([^)]*\))?/g, "Too Long; Didn't Read (TL;DR)")
        .replace(/\bBLUF\b(?!\s*\()/g, 'Bottom Line Up Front (BLUF)');
}

function buildVariantObj(v, entry, catCode, relatedPromptIds) {
    const isFirst = v === entry.variants[0];
    const isDual = entry.modeClass === 'dual';
    // Title: agent variants get 'Agent: ' prefix for dual prompts; expand abbreviations for V13
    const rawTitle = isDual && !isFirst ? `Agent: ${entry.title}` : entry.title;
    const title = expandAbbreviations(rawTitle);
    // Description: use title (always fully expanded)
    const description = title;

    const parameters = (v.parameters || []).map((p) => {
        const param = {
            name: p.name,
            control: p.control,
            optional: typeof p.optional === 'boolean' ? p.optional : false,
        };
        if (p.label) param.label = p.label;
        if (p.description) param.description = p.description;
        if (p.valueSet) param.valueSetId = VALUE_SET_ID_MAP[p.valueSet] || p.valueSet;
        return param;
    });

    // Resolve [[INJECT_RULES]] marker to proper {{param}} tokens
    const template = resolveInjectRules(v.template || '', v.parameters || []);

    const recommendedSystemPromptId = entry.recommendedSystemPrompt ?? null;

    return {
        id: v.id,
        kind: v.kind,
        categoryCode: catCode,
        title,
        description,
        template,
        parameters,
        examples: v.examples && Object.keys(v.examples).length > 0 ? v.examples : {},
        keywords: v.keywords || [],
        executionContext: v.mode,
        model: v.model ?? null,
        isMetaPrompt: typeof entry.isMetaPrompt === 'boolean' ? entry.isMetaPrompt : false,
        recommendedSystemPromptId,
        relatedPromptIds,
        relatedSkillIds: [],
        supports: entry.supports || { style: false, tone: false, context: false },
    };
}

function emitPromptTs(entry, catCode) {
    const relatedPromptIds = filterRelatedIds(entry.related || []);
    const variantAxes = entry.modeClass === 'dual' ? ['mode'] : [];
    const variants = entry.variants.map((v) => buildVariantObj(v, entry, catCode, relatedPromptIds));
    const defaultVariantId = variants.length > 0 ? variants[0].id : '';

    const logicalDef = {
        id: entry.id,
        categoryCode: catCode,
        title: entry.title,
        ...(entry.subtitle ? { subtitle: entry.subtitle } : {}),
        description: entry.subtitle || entry.title,
        variantAxes,
        defaultVariantId,
        modeClass: entry.modeClass || 'chat-only',
        variants,
    };

    const lines = [
        `import type { LogicalPromptDef } from '../../../model/types';`,
        ``,
        `export const prompt: LogicalPromptDef = ${serializeValue(logicalDef, 0)};`,
        ``,
    ];
    return lines.join('\n');
}

// ── Category barrel emitter ───────────────────────────────────────────────────

function emitCategoryIndexTs(promptFiles) {
    // promptFiles: array of { filename (no ext), varName }
    // Use .js extension: TypeScript ESM convention (ts-node/NodeNext resolves .js → .ts)
    const imports = promptFiles
        .map((f) => `import { prompt as ${f.varName} } from './${f.filename}.prompt.js';`)
        .join('\n');
    const exports = `export const prompts: LogicalPromptDef[] = [\n${promptFiles.map((f) => `    ${f.varName},`).join('\n')}\n];`;
    return [`import type { LogicalPromptDef } from '../../../model/types';`, ``, imports, ``, exports, ``].join('\n');
}

// ── Domain barrel emitter ─────────────────────────────────────────────────────

function emitDomainIndexTs(categoryFolders) {
    // categoryFolders: array of folder names like 'a01-code-generation'
    // Use .js extension: TypeScript ESM convention (ts-node/NodeNext resolves .js → .ts)
    const imports = categoryFolders
        .map((f, i) => {
            const varName = `cat${i}`;
            return `import { prompts as ${varName} } from './${f}/index.js';`;
        })
        .join('\n');
    const varNames = categoryFolders.map((_, i) => `cat${i}`);
    return [
        `import type { LogicalPromptDef } from '../../model/types';`,
        ``,
        imports,
        ``,
        `export const prompts: LogicalPromptDef[] = [${varNames.map((v) => `...${v}`).join(', ')}];`,
        ``,
    ].join('\n');
}

// ── Variable name from filename ───────────────────────────────────────────────

function varNameFromFilename(filename) {
    // 'sys' → 'sysPrompt'
    // 'function' → 'functionPrompt'
    // 'from-spec' → 'fromSpecPrompt'
    // 'how-might-we' → 'howMightWePrompt'
    const camel = filename
        .split('-')
        .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
        .join('');
    return camel + 'Prompt';
}

// ── Main processing ───────────────────────────────────────────────────────────

const mdFiles = readdirSync(contentDir)
    .filter((f) => f.endsWith('.md'))
    .sort();

// Step 1: Build catCode → slug map from standard filenames (e.g. b01-proofreading.md → B01:proofreading)
const catSlugMap = new Map();
for (const mdFile of mdFiles) {
    if (/^[a-z]\d+-/.test(mdFile)) {
        const { code, slug } = categoryFromFilename(mdFile);
        catSlugMap.set(code, slug);
    }
}

// Step 2: Parse all files and group entries by entry.category (handles cross-file categories)
const categoryEntriesMap = new Map();
for (const mdFile of mdFiles) {
    const entries = parseMarkdownFile(join(contentDir, mdFile));
    for (const entry of entries) {
        const catCode = entry.category || null;
        if (!catCode) {
            console.warn(`  [SKIP] ${entry.id}: no category field`);
            continue;
        }
        if (!categoryEntriesMap.has(catCode)) {
            categoryEntriesMap.set(catCode, []);
        }
        categoryEntriesMap.get(catCode).push(entry);
    }
}

// Step 3: Emit each category folder in sorted order
const categoryFolders = [];
const sortedCats = [...categoryEntriesMap.keys()].sort();

for (const catCode of sortedCats) {
    const catSlug = catSlugMap.get(catCode);
    if (!catSlug) {
        console.warn(`  [SKIP] unknown category code: ${catCode} (no matching standard file)`);
        continue;
    }

    const catFolder = `${catCode.toLowerCase()}-${catSlug}`;
    const catOutDir = join(domainOutDir, catFolder);
    mkdirSync(catOutDir, { recursive: true });

    const entries = categoryEntriesMap.get(catCode);
    const promptFiles = [];

    for (const entry of entries) {
        const isSys = isSystemEntry(entry);
        const slug = slugFromId(entry.id, isSys);
        const ts = emitPromptTs(entry, catCode);

        writeFileSync(join(catOutDir, `${slug}.prompt.ts`), ts, 'utf8');

        const varName = varNameFromFilename(slug);
        promptFiles.push({ filename: slug, varName });
    }

    // Emit category index.ts
    const catIndexTs = emitCategoryIndexTs(promptFiles);
    writeFileSync(join(catOutDir, 'index.ts'), catIndexTs, 'utf8');

    console.log(`  ${catFolder}: ${entries.length} prompts → ${promptFiles.length} files`);
    categoryFolders.push(catFolder);
}

// Emit domain index.ts
const domainIndexTs = emitDomainIndexTs(categoryFolders);
mkdirSync(domainOutDir, { recursive: true });
writeFileSync(join(domainOutDir, 'index.ts'), domainIndexTs, 'utf8');

console.log(`\n[build-library-modules] Done: ${domainArg} → ${domainOutDir}`);
