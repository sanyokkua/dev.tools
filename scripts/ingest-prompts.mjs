#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
function getArg(name) {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
}
const srcDir = getArg('--src') ?? join(process.cwd(), 'content/prompts-collection');
const outDir = getArg('--out') ?? join(process.cwd(), 'src/common/prompts/generated');

const META_CATEGORIES = JSON.parse(readFileSync(join(__dirname, 'ingest/meta-categories.json'), 'utf8'));
const MODEL_NAMES = JSON.parse(readFileSync(join(__dirname, 'ingest/model-names.json'), 'utf8'));
const TITLE_OVERRIDES = JSON.parse(readFileSync(join(__dirname, 'ingest/titles.json'), 'utf8'));

const SECTION_HEADERS = [
    '# Prompt ID',
    '# Domain / Category',
    '# Description',
    '# Prompt',
    '# Parameters',
    '# Example Values',
    '# Notes',
    '# Keywords',
];

function parseSections(content) {
    const sections = {};
    let currentHeader = null;
    for (const line of content.split('\n')) {
        const header = SECTION_HEADERS.find((h) => line.trim() === h);
        if (header) {
            currentHeader = header;
            sections[header] = [];
            continue;
        }
        if (currentHeader) sections[currentHeader].push(line);
    }
    return Object.fromEntries(Object.entries(sections).map(([k, v]) => [k, v.join('\n').trim()]));
}

function parseParams(parametersSection) {
    if (!parametersSection) return [];
    if (/^None/i.test(parametersSection.trim())) return [];
    const params = [];
    let current = null;
    for (const line of parametersSection.split('\n')) {
        const topLevel = line.match(/^- (\w[\w_-]*)\s*$/);
        if (topLevel) {
            current = { name: topLevel[1], description: '' };
            params.push(current);
            continue;
        }
        const descLine = line.match(/^\s+- Description:\s*(.+)/i);
        if (descLine && current) {
            current.description = descLine[1].trim();
        }
    }
    return params;
}

function parseExamples(exampleSection) {
    if (!exampleSection) return {};
    if (/^N\/A/i.test(exampleSection.trim())) return {};
    const result = {};
    let currentParam = null;
    for (const line of exampleSection.split('\n')) {
        const paramKey = line.match(/^(\w[\w_-]*):\s*$/);
        if (paramKey) {
            currentParam = paramKey[1];
            result[currentParam] = [];
            continue;
        }
        const val = line.match(/^- (.+)/);
        if (val && currentParam) {
            result[currentParam].push(val[1].trim().replace(/^"|"$/g, ''));
        }
    }
    return result;
}

// Full ID pattern: SYS-A03-code-review, USR-B09-work-statusUpdate, AGT-A03-review-changes etc.
const FULL_PROMPT_ID_RE = /^(?:SYS|USR|AGT)-[A-Z]\d+-[a-zA-Z][\w-]*$/;
const FULL_SKILL_ID_RE = /^SKILL-[a-zA-Z][\w-]*$/;

function parseRelationships(notesSection) {
    const result = { recommendedSystemPromptId: null, relatedPromptIds: [], relatedSkillIds: [] };
    if (!notesSection) return result;
    for (const line of notesSection.split('\n')) {
        const sysMatch = line.match(/Recommended system prompt:\s*`(SYS-[^`]+)`/i);
        if (sysMatch) result.recommendedSystemPromptId = sysMatch[1].trim();
        const relMatch = line.match(/Related:\s*(.+)/i);
        if (relMatch) {
            const backtickRefs = [...relMatch[1].matchAll(/`([^`]+)`/g)].map((m) => m[1].trim());
            for (const ref of backtickRefs) {
                if (FULL_SKILL_ID_RE.test(ref)) result.relatedSkillIds.push(ref);
                else if (FULL_PROMPT_ID_RE.test(ref)) result.relatedPromptIds.push(ref);
                // Skip partial IDs, wildcards, and shorthand patterns (e.g. USR-B09-work-*)
            }
        }
    }
    return result;
}

function buildSuggestedValues(params, examples) {
    return params.map((p) => ({
        ...p,
        suggestedValues: (examples[p.name] ?? []).filter((v, i, a) => a.indexOf(v) === i),
        allowCustom: true,
    }));
}

function deriveKind(id) {
    if (id.startsWith('SYS-')) return 'system';
    if (id.startsWith('USR-')) return 'user';
    if (id.startsWith('AGT-')) return 'agent';
    throw new Error(`Unknown prompt ID prefix: ${id}`);
}

function deriveCategoryCode(id) {
    const match = id.match(/^(?:SYS|USR|AGT)-([A-Z]\d+)/);
    if (!match) throw new Error(`Cannot derive category from ID: ${id}`);
    return match[1];
}

function deriveExecutionContext(kind) {
    if (kind === 'agent') return 'agent';
    return 'chat';
}

function isMetaPrompt(categoryCode, notesSection) {
    if (META_CATEGORIES.includes(categoryCode)) return true;
    if (notesSection && /\bMETA\b/.test(notesSection)) return true;
    return false;
}

function deriveConceptSlug(id) {
    const withoutPrefix = id.replace(/^(?:SYS|USR|AGT)-[A-Z]\d+-/, '');
    const modelTokens = Object.keys(MODEL_NAMES);
    for (const token of modelTokens) {
        const suffix = `-${token}`;
        if (withoutPrefix.endsWith(suffix)) {
            return { conceptSlug: withoutPrefix.slice(0, -suffix.length), modelToken: token };
        }
    }
    return { conceptSlug: withoutPrefix, modelToken: null };
}

function parseDomainCategory(domainCatLine) {
    const match = domainCatLine.match(/\/\s*([A-Z]\d+)\s+(.+)$/);
    if (match) return { categoryCode: match[1], categoryTitle: match[2].trim() };
    return { categoryCode: '', categoryTitle: '' };
}

function parsePromptFile(filePath) {
    const content = readFileSync(filePath, 'utf8');
    const sections = parseSections(content);
    const id = sections['# Prompt ID']?.split('\n')[0].trim();
    if (!id) throw new Error(`No prompt ID in ${filePath}`);
    const kind = deriveKind(id);
    const categoryCode = deriveCategoryCode(id);
    const { categoryTitle: catTitleFromFile } = parseDomainCategory(sections['# Domain / Category'] ?? '');
    const params = parseParams(sections['# Parameters']);
    const examples = parseExamples(sections['# Example Values']);
    const relationships = parseRelationships(sections['# Notes']);
    const suggestedParams = buildSuggestedValues(params, examples);
    const { conceptSlug, modelToken } = deriveConceptSlug(id);
    const model = modelToken ? (MODEL_NAMES[modelToken]?.label ?? modelToken) : null;
    const meta = isMetaPrompt(categoryCode, sections['# Notes']);
    return {
        id,
        kind,
        categoryCode,
        title:
            TITLE_OVERRIDES[conceptSlug] ??
            conceptSlug
                .split('-')
                .map((w) => w[0].toUpperCase() + w.slice(1))
                .join(' '),
        description: sections['# Description'] ?? '',
        template: sections['# Prompt'] ?? '',
        isMetaPrompt: meta,
        executionContext: deriveExecutionContext(kind),
        model,
        subVariant: null,
        parameters: suggestedParams,
        examples,
        keywords: (sections['# Keywords'] ?? '')
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
        recommendedSystemPromptId: relationships.recommendedSystemPromptId,
        relatedPromptIds: relationships.relatedPromptIds,
        relatedSkillIds: relationships.relatedSkillIds,
        _conceptSlug: conceptSlug,
        _catTitle: catTitleFromFile,
    };
}

function parseYamlFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { meta: {}, body: content };
    const yamlLines = match[1].split('\n');
    const meta = {};
    let multilineKey = null;
    let multilineMode = null; // '>' (folded) or '|' (literal)
    let multilineLines = [];
    function flushMultiline() {
        if (multilineKey === null) return;
        const joined =
            multilineMode === '|' ? multilineLines.join('\n').trimEnd() : multilineLines.join(' ').trim();
        meta[multilineKey] = joined;
        multilineKey = null;
        multilineMode = null;
        multilineLines = [];
    }
    for (const line of yamlLines) {
        // If we are collecting a multiline block, check if this line is a continuation
        if (multilineKey !== null) {
            if (line.startsWith(' ') || line.startsWith('\t')) {
                multilineLines.push(line.trim());
                continue;
            } else {
                flushMultiline();
                // Fall through to parse this line as a new key
            }
        }
        const colonIdx = line.indexOf(':');
        if (colonIdx < 0) continue;
        const key = line.slice(0, colonIdx).trim();
        const rawVal = line.slice(colonIdx + 1).trim();
        const arrMatch = rawVal.match(/^\[(.+)\]$/);
        if (arrMatch) {
            meta[key] = arrMatch[1].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        } else if (rawVal === '>' || rawVal === '|') {
            // Start collecting a folded (>) or literal (|) block scalar
            multilineKey = key;
            multilineMode = rawVal;
            multilineLines = [];
        } else {
            meta[key] = rawVal.replace(/^"|"$/g, '');
        }
    }
    flushMultiline();
    return { meta, body: content.slice(match[0].length).trim() };
}

function parseSkillFolder(skillSlug, skillDir, domainCode) {
    const skillMdPath = join(skillDir, 'SKILL.md');
    if (!existsSync(skillMdPath)) throw new Error(`Missing SKILL.md in ${skillDir}`);
    const { meta } = parseYamlFrontmatter(readFileSync(skillMdPath, 'utf8'));
    const files = readdirSync(skillDir)
        .map((fname) => {
            const fpath = join(skillDir, fname);
            if (!statSync(fpath).isFile()) return null;
            return {
                path: fname,
                role: fname === 'SKILL.md' ? 'skill' : 'reference',
                content: readFileSync(fpath, 'utf8'),
            };
        })
        .filter(Boolean);

    const rawTools = meta['allowed-tools'] ?? '';
    const allowedTools = Array.isArray(rawTools)
        ? rawTools
        : String(rawTools)
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean);

    const rawRelated = meta['related-skills'] ?? [];
    const relatedSkillIds = (Array.isArray(rawRelated) ? rawRelated : [])
        .map((entry) => {
            if (typeof entry === 'string') {
                const slug = entry.split(':')[0].trim();
                return `SKILL-${slug}`;
            }
            return null;
        })
        .filter(Boolean);

    return {
        id: `SKILL-${skillSlug}`,
        slug: skillSlug,
        domainCode,
        title: meta['name'] ?? skillSlug,
        version: String(meta['version'] ?? '1.0.0'),
        description: String(meta['description'] ?? '').trim(),
        tags: meta['tags'] ?? [],
        allowedTools,
        relatedSkillIds,
        files,
    };
}

function resolveConceptTitle(conceptSlug) {
    return TITLE_OVERRIDES[conceptSlug] ?? conceptSlug;
}

function groupLogicalPrompts(variants) {
    // Group by (categoryCode, resolvedTitle) so that USR/AGT pairs with different slugs but
    // the same TITLE_OVERRIDES entry (e.g. review-change / review-changes → "Review a Change")
    // end up in the same LogicalPrompt.
    const groups = {};
    const groupSlug = {}; // canonical slug per group key (prefer USR variant's slug)
    for (const v of variants) {
        const resolvedTitle = resolveConceptTitle(v._conceptSlug);
        const groupKey = `${v.categoryCode}::${resolvedTitle}`;
        if (!groups[groupKey]) {
            groups[groupKey] = [];
            groupSlug[groupKey] = v._conceptSlug;
        }
        // Prefer the slug from a user (non-agent) variant as the canonical one
        if (v.kind === 'user') groupSlug[groupKey] = v._conceptSlug;
        groups[groupKey].push(v);
    }
    return Object.entries(groups).map(([key, groupVariants]) => {
        const [categoryCode] = key.split('::');
        const conceptSlug = groupSlug[key];
        const axes = [];
        const models = new Set(groupVariants.map((v) => v.model).filter(Boolean));
        const contexts = new Set(groupVariants.map((v) => v.executionContext));
        if (models.size > 1) axes.push('model');
        if (contexts.size > 1) axes.push('executionContext');
        const defaultV = groupVariants.find((v) => v.kind === 'user') ?? groupVariants[0];
        return {
            id: `LP-${categoryCode}-${conceptSlug}`,
            categoryCode,
            title: TITLE_OVERRIDES[conceptSlug] ?? groupVariants[0].title,
            description: defaultV.description,
            variantAxes: axes,
            variantIds: groupVariants.map((v) => v.id),
            defaultVariantId: defaultV.id,
        };
    });
}

const DOMAIN_NAMES = {
    A: { title: 'Software Engineering', slug: 'software-engineering', description: 'Code, architecture, and DevOps' },
    B: { title: 'Writing & Communication', slug: 'writing-communication', description: 'Text, documentation, editing' },
    C: { title: 'Thinking & Productivity', slug: 'thinking-productivity', description: 'Analysis, research, planning' },
    D: {
        title: 'AI & Prompt Workflows',
        slug: 'ai-prompt-workflows',
        description: 'Prompt engineering and AI tooling',
    },
};

function domainCodeFromDir(dirName) {
    const match = dirName.match(/^([A-Z])_/);
    return match ? match[1] : dirName[0];
}

function main() {
    const variants = [];
    const skills = [];

    const domainDirs = readdirSync(srcDir).filter((d) => {
        const full = join(srcDir, d);
        return statSync(full).isDirectory() && /^[A-Z]_/.test(d);
    });

    for (const domainDir of domainDirs) {
        const domainCode = domainCodeFromDir(domainDir);
        const domainPath = join(srcDir, domainDir);

        for (const subdir of ['SYSTEM_PROMPTS', 'USER_PROMPTS']) {
            const subdirPath = join(domainPath, subdir);
            if (!existsSync(subdirPath)) continue;
            const files = readdirSync(subdirPath).filter((f) => f.endsWith('.md'));
            for (const fname of files) {
                variants.push(parsePromptFile(join(subdirPath, fname)));
            }
        }

        const skillsDir = join(domainPath, 'SKILLS');
        if (existsSync(skillsDir)) {
            for (const slug of readdirSync(skillsDir)) {
                const skillDir = join(skillsDir, slug);
                if (!statSync(skillDir).isDirectory()) continue;
                skills.push(parseSkillFolder(slug, skillDir, domainCode));
            }
        }
    }

    const catTitleMap = {};
    for (const v of variants) {
        if (!catTitleMap[v.categoryCode] && v._catTitle) catTitleMap[v.categoryCode] = v._catTitle;
    }
    const categorySet = new Set(variants.map((v) => v.categoryCode));
    const domainSet = new Set([...categorySet].map((c) => c.replace(/\d+/, '')));
    const domains = [...domainSet].sort().map((code) => ({ code, ...DOMAIN_NAMES[code] }));
    const categories = [...categorySet].sort().map((code) => {
        const domCode = code.replace(/\d+/, '');
        const title = catTitleMap[code] ?? `Category ${code}`;
        const slug = title
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        const sysPrompt = variants.find((v) => v.kind === 'system' && v.categoryCode === code);
        return { code, domainCode: domCode, slug, title, recommendedSystemPromptId: sysPrompt?.id ?? null };
    });

    const logical = groupLogicalPrompts(variants.filter((v) => v.kind !== 'system'));

    const cleanVariants = variants.map(({ _conceptSlug, _catTitle, ...rest }) => rest);

    const allIds = new Set(cleanVariants.map((v) => v.id));
    const allSkillIds = new Set(skills.map((s) => s.id));

    // Filter advisory refs to only include resolved IDs (prose notes may contain partial/shorthand refs)
    for (const v of cleanVariants) {
        v.relatedPromptIds = (v.relatedPromptIds ?? []).filter((rid) => allIds.has(rid));
        v.relatedSkillIds = (v.relatedSkillIds ?? []).filter((rid) => allSkillIds.has(rid));
    }

    // Hard validation: recommendedSystemPromptId must resolve (it's machine-critical)
    const errors = [];
    for (const v of cleanVariants) {
        if (v.recommendedSystemPromptId && !allIds.has(v.recommendedSystemPromptId)) {
            errors.push(`Dangling recommendedSystemPromptId: ${v.recommendedSystemPromptId} in ${v.id}`);
        }
    }
    for (const lp of logical) {
        if (!allIds.has(lp.defaultVariantId)) {
            errors.push(`defaultVariantId not found: ${lp.defaultVariantId}`);
        }
    }
    if (errors.length > 0) {
        console.error('Ingestion validation errors:');
        errors.forEach((e) => console.error(`  ✗ ${e}`));
        process.exit(1);
    }

    const indexPath = join(srcDir, 'INDEX.md');
    if (existsSync(indexPath)) {
        const idx = readFileSync(indexPath, 'utf8');
        const sysCt = cleanVariants.filter((v) => v.kind === 'system').length;
        const uaCt = cleanVariants.filter((v) => v.kind !== 'system').length;
        const skillCt = skills.length;
        const sysLine = idx.match(/System prompts:\s*(\d+)/i);
        const uaLine = idx.match(/User\/agent prompts:\s*(\d+)/i);
        const skillLine = idx.match(/Skills:\s*(\d+)/i);
        const countErrors = [];
        if (sysLine && parseInt(sysLine[1]) !== sysCt)
            countErrors.push(`INDEX system count mismatch: expected ${sysLine[1]}, got ${sysCt}`);
        if (uaLine && parseInt(uaLine[1]) !== uaCt)
            countErrors.push(`INDEX user/agent count mismatch: expected ${uaLine[1]}, got ${uaCt}`);
        if (skillLine && parseInt(skillLine[1]) !== skillCt)
            countErrors.push(`INDEX skills count mismatch: expected ${skillLine[1]}, got ${skillCt}`);
        if (countErrors.length > 0) {
            countErrors.forEach((e) => console.error(`  ✗ ${e}`));
            process.exit(1);
        }
    }

    mkdirSync(outDir, { recursive: true });
    writeFileSync(
        join(outDir, 'prompts-data.json'),
        JSON.stringify({ domains, categories, logical, variants: cleanVariants }, null, 2),
    );
    writeFileSync(join(outDir, 'skills-data.json'), JSON.stringify({ skills }, null, 2));

    const sysCt = cleanVariants.filter((v) => v.kind === 'system').length;
    const uaCt = cleanVariants.filter((v) => v.kind !== 'system').length;
    console.log(
        `✓ Ingested: System prompts: ${sysCt} | User/agent prompts: ${uaCt} | Logical groups: ${logical.length} | Skills: ${skills.length}`,
    );
}

main();
