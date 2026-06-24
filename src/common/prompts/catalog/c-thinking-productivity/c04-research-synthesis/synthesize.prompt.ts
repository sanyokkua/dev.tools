import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-C04-synthesize',
    categoryCode: 'C04',
    title: 'Synthesize Sources',
    subtitle: 'Integrate multiple sources into defensible findings — attributed, never fabricated',
    description: 'Integrate multiple sources into defensible findings — attributed, never fabricated',
    variantAxes: ['mode'],
    defaultVariantId: 'USR-C04-synthesize',
    modeClass: 'dual',
    variants: [
        {
            id: 'USR-C04-synthesize',
            kind: 'user',
            categoryCode: 'C04',
            title: 'Synthesize Sources',
            description: 'Synthesize Sources',
            template: `Synthesize the sources below into defensible findings.

This is SYNTHESIS, not a per-source summary: integrate information ACROSS the sources to produce findings that no single source states alone. (Summarizing restates one source; synthesizing combines several into a new, defensible claim.)

Rules:
1. For each finding, note which sources support it, and flag where sources agree, disagree, or are silent.
2. Attribute every claim to its source.
3. Do NOT invent facts, quotes, statistics, citations, or Digital Object Identifiers (DOIs). If a detail is not supported by the sources, say so — a fabricated reference is the worst possible outcome here.
4. Separate what the sources support from your own inference, and label each inference as "(inference)".
5. Lead with the single most important finding.

Sources:
\`\`\`
{{sources}}
\`\`\`

Output: **Findings** (each with its supporting sources, most important first) · **Agreements / conflicts / gaps** across the sources · **What remains uncertain or unverified**.
`,
            parameters: [
                {
                    name: 'sources',
                    label: 'Sources',
                    description: 'The source material to synthesize — notes, excerpts, or references with content.',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                sources: [
                    'Notes from three articles on remote-work productivity (one survey, one controlled study, one opinion piece).',
                    'Vendor docs + an independent benchmark + a practitioner blog post about the same caching tool.',
                ],
            },
            keywords: ['synthesis', 'findings', 'multiple sources', 'attribution', 'research', 'integrate', 'C04'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C04-research-synthesis',
            relatedPromptIds: ['LP-C04-matrix', 'LP-C04-source-eval', 'LP-C03-research-plan'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'AGT-C04-synthesize',
            kind: 'agent',
            categoryCode: 'C04',
            title: 'Agent: Synthesize Sources',
            description: 'Synthesize Sources',
            template: `You are synthesizing a folder of sources, working in an agent environment with file access. Integrate ACROSS the files into defensible findings — this is synthesis, not a per-file summary.

Steps:
1. Traverse \`{{folder_path}}\` and read the relevant source files. List the files you actually used (real paths only — never invent a filename, path, quote, or statistic). If the folder is empty or unreadable, say so and stop.
2. If a synthesis question is given, organize findings to answer it; otherwise surface the folder's main themes.
3. Produce findings that no single file states alone. For each finding, cite the real file paths that support it, and flag where files agree, disagree, or are silent.
4. Quote only text that actually appears in a file, and attribute it to the real path. Do NOT invent facts, quotes, statistics, citations, or Digital Object Identifiers (DOIs). If a detail is not in any file, say so.
5. Separate what the files support from your own inference; label each inference "(inference)".

Synthesis question (optional): \`\`\`{{question}}\`\`\`

Output: **Files used** (real paths) · **Findings** (most important first, each citing the supporting file paths) · **Agreements / conflicts / gaps** · **What remains uncertain or unverified**. Cite only files that exist; fabricate nothing.
`,
            parameters: [
                {
                    name: 'folder_path',
                    label: 'Source folder',
                    description: 'Path to the folder of source files to synthesize.',
                    control: 'text',
                    optional: false,
                },
                {
                    name: 'question',
                    label: 'Synthesis question (optional)',
                    description:
                        "The specific question the synthesis should answer; if blank, synthesize the folder's main themes.",
                    control: 'textarea',
                    optional: true,
                },
            ],
            examples: {
                folder_path: ['./research/remote-work', 'docs/sources'],
                question: ['Does remote work raise or lower measured productivity, and under what conditions?', ''],
            },
            keywords: ['synthesis', 'folder', 'findings', 'attribution', 'cite paths', 'agent', 'research', 'C04'],
            executionContext: 'agent',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C04-research-synthesis',
            relatedPromptIds: ['LP-C04-matrix', 'LP-C04-source-eval', 'LP-C03-research-plan'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
