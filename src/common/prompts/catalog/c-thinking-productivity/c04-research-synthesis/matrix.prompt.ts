import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-C04-matrix',
    categoryCode: 'C04',
    title: 'Build a Comparison Matrix',
    subtitle: 'A literature/synthesis matrix across sources to surface agreements, conflicts, and gaps',
    description: 'A literature/synthesis matrix across sources to surface agreements, conflicts, and gaps',
    variantAxes: [],
    defaultVariantId: 'USR-C04-matrix',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-C04-matrix',
            kind: 'user',
            categoryCode: 'C04',
            title: 'Build a Comparison Matrix',
            description: 'Build a Comparison Matrix',
            template: `Build a comparison matrix (a literature / synthesis matrix) across the sources below.

Rules:
1. Put the sources as rows and the relevant comparison dimensions as columns. Derive the dimensions from the question or the content — common ones: claim/position, method, key findings, conditions/scope, limitations.
2. Fill each cell STRICTLY from the source. Where a source is silent on a dimension, write "not addressed" — do not infer or fill a gap.
3. Do NOT invent data, quotes, statistics, or citations. If a source's detail is unclear, mark it as unclear rather than guessing.
4. After the matrix, write a short patterns note: where sources AGREE, where they CONFLICT, and the GAPS no source covers.

Sources:
\`\`\`
{{sources}}
\`\`\`

Output: the matrix as a Markdown table (sources × dimensions) · a short **Patterns** note (agreements / conflicts / gaps) · **What to investigate next**.
`,
            parameters: [
                {
                    name: 'sources',
                    label: 'Sources',
                    description: 'The sources to compare, with their content/claims.',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                sources: [
                    'Three papers/articles on remote-work productivity, each with its own dataset and claim.',
                    'Benchmarks from three vendors for the same database operation.',
                ],
            },
            keywords: ['literature matrix', 'comparison', 'sources', 'patterns', 'gaps', 'research', 'C04'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C04-research-synthesis',
            relatedPromptIds: ['LP-C04-synthesize', 'LP-C04-source-eval'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
