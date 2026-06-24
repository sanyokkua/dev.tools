import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-C01-generate-ideas',
    categoryCode: 'C01',
    title: 'Generate Ideas',
    subtitle: 'Produce a target number of varied ideas with evaluation deferred',
    description: 'Produce a target number of varied ideas with evaluation deferred',
    variantAxes: [],
    defaultVariantId: 'USR-C01-generate-ideas',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-C01-generate-ideas',
            kind: 'user',
            categoryCode: 'C01',
            title: 'Generate Ideas',
            description: 'Generate Ideas',
            template: `Generate {{count}} varied ideas for the problem below. This is divergent ideation — do NOT evaluate, rank, critique, or filter any idea yet.

Rules:
1. Aim for breadth. Spread the {{count}} ideas across categories: cheap vs expensive, incremental vs radical, build vs buy vs partner, conventional vs unconventional. Do not cluster around one theme.
2. Push past the obvious first three. The early ideas are usually the least original; keep going.
3. Keep each idea to one concrete sentence — specific enough that a reader could act on it, not a vague direction.
4. No evaluation language. Do not write "but", "the downside", "this won't scale", or any judgment. Save that for a separate decision step.
5. No duplicates or trivial restatements.

Problem:
\`\`\`
{{problem}}
\`\`\`

Output: a numbered list of exactly {{count}} distinct ideas, nothing else. (To evaluate them afterward, use a C02 decision-support prompt such as Build a Weighted Decision Matrix or Prioritize a Backlog.)
`,
            parameters: [
                {
                    name: 'problem',
                    label: 'Problem or opportunity',
                    description: 'The problem or opportunity to ideate on. Paste any relevant context.',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'count',
                    label: 'How many ideas',
                    description: 'Target number of ideas (e.g. 15, 20).',
                    control: 'text',
                    optional: false,
                },
            ],
            examples: {
                problem: [
                    'Reduce p95 API latency without adding infrastructure cost. Current p95 is 800 ms; the service is read-heavy and backed by a single Postgres instance.',
                    'Increase trial-to-paid conversion for our B2B analytics product. Trials are 14 days; ~3% convert; most churned users never connect a data source.',
                ],
                count: ['15', '20'],
            },
            keywords: ['brainstorm', 'ideas', 'divergent', 'generate', 'options', 'ideation', 'C01'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C01-ideation',
            relatedPromptIds: ['LP-C01-how-might-we', 'LP-C01-scamper', 'LP-C02-weighted-matrix', 'LP-C02-prioritize'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
