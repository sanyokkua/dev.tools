import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-C02-weighted-matrix',
    categoryCode: 'C02',
    title: 'Build a Weighted Decision Matrix',
    subtitle: 'Score options against weighted criteria, with honest ties and no gaming',
    description: 'Score options against weighted criteria, with honest ties and no gaming',
    variantAxes: [],
    defaultVariantId: 'USR-C02-weighted-matrix',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-C02-weighted-matrix',
            kind: 'user',
            categoryCode: 'C02',
            title: 'Build a Weighted Decision Matrix',
            description: 'Build a Weighted Decision Matrix',
            template: `Build a weighted decision matrix for the options and criteria below.

Method (follow exactly):
1. Lay out a table with the criteria as rows and the options as columns.
2. Assign each criterion a weight. If weights are given, use them. If not, propose reasonable weights (either summing to 1.0, or a 1–5 importance scale) and label them clearly as **proposed**.
3. Score each option on each criterion 1–5. For any non-obvious score, add a one-line basis.
4. Multiply score × weight for each cell; sum per option to a **weighted total**.
5. Treat results within ~10–15% of each other as a TIE to be decided on judgment, not the number. Do NOT reverse-engineer scores or weights to produce a desired winner.

Options:
\`\`\`
{{options}}
\`\`\`

Criteria (with weights/importance if given):
\`\`\`
{{criteria}}
\`\`\`

Output: the matrix with weighted totals · the leading option(s) and the criteria driving the lead · the leader's main downside · and what would change the result (which weight or score, if it moved, flips the winner).
`,
            parameters: [
                {
                    name: 'options',
                    label: 'Options',
                    description: 'The options to compare (one per line or separated).',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'criteria',
                    label: 'Criteria (with weights if known)',
                    description: 'The decision criteria and their weights/importance, if known.',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                options: ['Kafka | RabbitMQ | Amazon SQS', 'Vendor A | Vendor B | build in-house'],
                criteria: [
                    'throughput (0.30), operational burden (0.25), team familiarity (0.20), cost (0.15), ecosystem/tooling (0.10)',
                ],
            },
            keywords: ['weighted matrix', 'decision', 'score', 'criteria', 'options', 'recommend', 'C02'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C02-decision-support',
            relatedPromptIds: ['LP-C02-pros-cons', 'LP-C02-compare-solutions'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
