#!/usr/bin/env node
// Build-time validator + codegen. Run via: node scripts/build-prompts.mjs [--src <path>] [--out <path>]

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

// ── CLI args ──────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
function getArg(flag) {
    const i = argv.indexOf(flag);
    return i !== -1 ? argv[i + 1] : undefined;
}
const srcArg = getArg('--src') ?? 'src/common/prompts/catalog/index';
const outArg = getArg('--out') ?? 'src/common/prompts';
const srcPath = resolve(process.cwd(), srcArg);
const outDir = resolve(process.cwd(), outArg);

// ── Abbreviation allowlist (build-policy constant, not registry data) ─────────
const ABBR_ALLOWLIST = new Set([
    'SQL',
    'API',
    'CI/CD',
    'CI',
    'CD',
    'HTML',
    'CSS',
    'JSON',
    'YAML',
    'XML',
    'URL',
    'HTTP',
    'HTTPS',
    'REST',
    'CRUD',
    'UUID',
    'ORM',
]);

// ── Load source module ────────────────────────────────────────────────────────
async function loadSrc(path) {
    for (const candidate of [path, path + '.ts', path + '.mjs', path + '.js']) {
        if (existsSync(candidate)) {
            return await import(pathToFileURL(candidate).href);
        }
    }
    return null;
}

const mod = await loadSrc(srcPath);

if (!mod) {
    console.warn(`[build-prompts] No catalog found at "${srcPath}". Emitting empty manifest.`);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'manifest.generated.ts'), emitEmptyManifest(), 'utf8');
    writeFileSync(join(outDir, 'loaders.generated.ts'), emitEmptyLoaders(), 'utf8');
    process.exit(0);
}

const MODELS = mod.MODELS ?? [];
const STYLES = mod.STYLES ?? [];
const TONES = mod.TONES ?? [];
const CONTEXTS = mod.CONTEXTS ?? [];
const VALUE_SETS = mod.VALUE_SETS ?? [];
const ABBREVIATIONS = mod.ABBREVIATIONS ?? {};
const domains = mod.domains ?? [];
const categories = mod.categories ?? [];
const prompts = mod.prompts ?? [];
const skills = mod.skills ?? [];

// ── Validators ────────────────────────────────────────────────────────────────
const errors = [];
function err(msg) {
    errors.push(msg);
}

// V1: Unique logical IDs
const logicalIds = new Set();
for (const p of prompts) {
    if (logicalIds.has(p.id)) err(`Duplicate logical id: "${p.id}"`);
    logicalIds.add(p.id);
}

// V2: Unique variant IDs
const variantIds = new Set();
for (const p of prompts) {
    for (const v of p.variants ?? []) {
        if (variantIds.has(v.id)) err(`Duplicate variant id: "${v.id}" in logical "${p.id}"`);
        variantIds.add(v.id);
    }
}

// V3: defaultVariantId resolves
for (const p of prompts) {
    const ids = (p.variants ?? []).map((v) => v.id);
    if (p.defaultVariantId && !ids.includes(p.defaultVariantId)) {
        err(`"${p.id}": defaultVariantId "${p.defaultVariantId}" not found in variants`);
    }
}

// V4: recommendedSystemPromptId resolves (variant-level)
const allPromptIds = new Set([...logicalIds, ...variantIds]);
for (const p of prompts) {
    for (const v of p.variants ?? []) {
        if (v.recommendedSystemPromptId && !allPromptIds.has(v.recommendedSystemPromptId)) {
            err(`"${v.id}": recommendedSystemPromptId "${v.recommendedSystemPromptId}" not found`);
        }
    }
}

// V5: relatedPromptIds resolve
for (const p of prompts) {
    for (const v of p.variants ?? []) {
        for (const ref of v.relatedPromptIds ?? []) {
            if (!allPromptIds.has(ref)) err(`"${v.id}": relatedPromptId "${ref}" not found`);
        }
    }
}

// V6: relatedSkillIds resolve
const allSkillIds = new Set(skills.map((s) => s.id));
for (const p of prompts) {
    for (const v of p.variants ?? []) {
        for (const ref of v.relatedSkillIds ?? []) {
            if (!allSkillIds.has(ref)) err(`"${v.id}": relatedSkillId "${ref}" not found`);
        }
    }
}

// V7: variant.model resolves
const modelIds = new Set(MODELS.map((m) => m.id));
for (const p of prompts) {
    for (const v of p.variants ?? []) {
        if (v.model != null && v.model !== '' && !modelIds.has(v.model)) {
            err(`"${v.id}": model "${v.model}" not in MODELS registry`);
        }
    }
}

// V8-V11: Template param integrity
const PARAM_RE = /\{\{(\w+)\}\}/g;
const VALID_CONTROLS = new Set(['textarea', 'text', 'select', 'combobox']);
const vsIds = new Set(VALUE_SETS.map((vs) => vs.id));
for (const p of prompts) {
    for (const v of p.variants ?? []) {
        const declaredNames = new Set((v.parameters ?? []).map((param) => param.name));
        const usedNames = new Set([...v.template.matchAll(PARAM_RE)].map((m) => m[1]));

        // V8: undeclared template token
        for (const token of usedNames) {
            if (!declaredNames.has(token))
                err(`"${v.id}": template uses {{${token}}} but no parameter named "${token}" declared`);
        }
        // V9: unused declared param
        for (const param of v.parameters ?? []) {
            if (!usedNames.has(param.name))
                err(`"${v.id}": parameter "${param.name}" declared but not used in template`);
        }
        // V10: param.control validity
        for (const param of v.parameters ?? []) {
            if (!VALID_CONTROLS.has(param.control))
                err(`"${v.id}": param "${param.name}" has invalid control "${param.control}"`);
        }
        // V11: param.valueSetId resolves
        for (const param of v.parameters ?? []) {
            if (param.valueSetId && !vsIds.has(param.valueSetId)) {
                err(`"${v.id}": param "${param.name}" references unknown valueSetId "${param.valueSetId}"`);
            }
        }
    }
}

// V12: Title naming lint (snake_case + camelCase residue)
const SNAKE_RE = /\b\w+_\w+\b/;
const CAMEL_RE = /\b[a-z]+(?:[A-Z][a-z]*)+\b/;
for (const p of prompts) {
    if (SNAKE_RE.test(p.title)) err(`"${p.id}": title contains snake_case residue: "${p.title}"`);
    if (CAMEL_RE.test(p.title)) err(`"${p.id}": title contains camelCase residue: "${p.title}"`);
}

// V13: Abbreviation lint on user-facing fields
const abbrKeys = Object.keys(ABBREVIATIONS).filter((k) => !ABBR_ALLOWLIST.has(k));
if (abbrKeys.length > 0) {
    const sortedKeys = [...abbrKeys].sort((a, b) => b.length - a.length);
    const abbrRe = new RegExp(
        `(?<![A-Za-z(])(${sortedKeys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![A-Za-z)])`,
        'g',
    );
    for (const p of prompts) {
        for (const v of p.variants ?? []) {
            const fields = { title: v.title, description: v.description, notes: v.notes ?? '' };
            for (const [fieldName, text] of Object.entries(fields)) {
                if (!text) continue;
                const matches = [...text.matchAll(abbrRe)].map((m) => m[1]);
                for (const m of matches)
                    err(`"${v.id}": bare abbreviation "${m}" in ${fieldName} — use "${ABBREVIATIONS[m]}" instead`);
            }
        }
    }
}

// V14: CONTEXTS styleId/toneId resolve
const styleIds = new Set(STYLES.map((s) => s.id));
const toneIds = new Set(TONES.map((t) => t.id));
for (const ctx of CONTEXTS) {
    if (ctx.styleId && !styleIds.has(ctx.styleId)) err(`Context "${ctx.id}": styleId "${ctx.styleId}" not in STYLES`);
    if (ctx.toneId && !toneIds.has(ctx.toneId)) err(`Context "${ctx.id}": toneId "${ctx.toneId}" not in TONES`);
}

// ── Report & exit ─────────────────────────────────────────────────────────────
if (errors.length > 0) {
    console.error(`[build-prompts] ${errors.length} validation error(s):`);
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
}

// ── Codegen ───────────────────────────────────────────────────────────────────
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'manifest.generated.ts'), emitManifest(domains, categories, prompts, skills), 'utf8');
writeFileSync(join(outDir, 'loaders.generated.ts'), emitLoaders(domains, categories, skills), 'utf8');

const logicalCount = prompts.length;
const variantCount = prompts.reduce((n, p) => n + (p.variants?.length ?? 0), 0);
const skillCount = skills.length;
const categoryCount = categories.length;
console.log(
    `[build-prompts] OK — ${logicalCount} logical, ${variantCount} variants, ${categoryCount} categories, ${skillCount} skills`,
);

// ── Emitters ──────────────────────────────────────────────────────────────────
function serialize(obj) {
    return JSON.stringify(obj, null, 4);
}

function emitEmptyManifest() {
    return `// GENERATED — do not edit. Regenerate with: npm run build:prompts
import type { Manifest } from './model/types';

export const MANIFEST: Manifest = {
    domains: [],
    categories: [],
    logical: [],
    skills: [],
};
`;
}

function emitEmptyLoaders() {
    return `// GENERATED — do not edit. Regenerate with: npm run build:prompts
import type { LogicalPromptDef, SkillDef } from './model/types';

export const CATEGORY_LOADERS: Record<string, () => Promise<{ prompts: LogicalPromptDef[] }>> = {};

export const SKILL_LOADERS: Record<string, () => Promise<{ skill: SkillDef }>> = {};
`;
}

function emitManifest(domains, categories, prompts, skills) {
    const domainByCode = Object.fromEntries(domains.map((d) => [d.code, d]));

    const logical = prompts.map((p) => {
        const allVariants = p.variants ?? [];
        const hasChat = allVariants.some((v) => v.executionContext === 'chat');
        const hasAgent = allVariants.some((v) => v.executionContext === 'agent');
        const modelVariants = allVariants.filter((v) => v.model != null && v.model !== '');
        const hasModel = modelVariants.length > 0;
        const cat = categories.find((c) => c.code === p.categoryCode);
        const dom = cat ? domainByCode[cat.domainCode] : undefined;
        const allKeywords = [...new Set(allVariants.flatMap((v) => v.keywords ?? []))];
        const isMetaPrompt = allVariants.some((v) => v.isMetaPrompt === true);
        return {
            id: p.id,
            categoryCode: p.categoryCode,
            domainCode: dom?.code ?? '',
            title: p.title,
            ...(p.subtitle ? { subtitle: p.subtitle } : {}),
            description: p.description,
            tags: [],
            variantAxes: p.variantAxes ?? [],
            hasChat,
            hasAgent,
            hasModel,
            modelCount: modelVariants.length,
            modeClass: p.modeClass ?? undefined,
            isMetaPrompt,
            keywords: allKeywords,
        };
    });

    const skillsManifest = skills.map((s) => ({
        id: s.id,
        slug: s.slug,
        domainCode: s.domainCode,
        title: s.title,
        version: s.version,
        description: s.description,
        tags: s.tags ?? [],
        fileCount: (s.files ?? []).length,
    }));

    return `// GENERATED — do not edit. Regenerate with: npm run build:prompts
import type { Manifest } from './model/types';

export const MANIFEST: Manifest = ${serialize({ domains, categories, logical, skills: skillsManifest })};
`;
}

function emitLoaders(domains, categories, skills) {
    const domainByCode = Object.fromEntries(domains.map((d) => [d.code, d]));

    const categoryEntries = categories
        .map((cat) => {
            const dom = domainByCode[cat.domainCode];
            const domSlug = dom ? `${dom.code.toLowerCase()}-${dom.slug}` : cat.domainCode.toLowerCase();
            const catFolder = `${cat.code.toLowerCase()}-${cat.slug}`;
            const importPath = `./catalog/${domSlug}/${catFolder}`;
            return `    ${JSON.stringify(cat.code)}: () => import('${importPath}'),`;
        })
        .join('\n');

    const skillEntries = skills
        .map((s) => {
            return `    ${JSON.stringify(s.slug)}: () => import('./skills/${s.slug}/skill'),`;
        })
        .join('\n');

    return `// GENERATED — do not edit. Regenerate with: npm run build:prompts
import type { LogicalPromptDef, SkillDef } from './model/types';

export const CATEGORY_LOADERS: Record<string, () => Promise<{ prompts: LogicalPromptDef[] }>> = {
${categoryEntries}
};

export const SKILL_LOADERS: Record<string, () => Promise<{ skill: SkillDef }>> = {
${skillEntries}
};
`;
}
