import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A07-tradeoff',
    categoryCode: 'A07',
    title: 'Build a Trade-off Matrix',
    subtitle: 'Weighted comparison of options against criteria, with an honest call',
    description: 'Weighted comparison of options against criteria, with an honest call',
    variantAxes: [],
    defaultVariantId: 'USR-A07-arch-tradeoff',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A07-arch-tradeoff',
            kind: 'user',
            categoryCode: 'A07',
            title: 'Build a Trade-off Matrix',
            description: 'Build a Trade-off Matrix',
            template: `You are a software architect. Build a weighted trade-off matrix comparing the options against the criteria below, then recommend honestly.

Options:
\`\`\`
{{options}}
\`\`\`

Criteria (with importance, if given):
\`\`\`
{{criteria}}
\`\`\`

Rules:
1. Put options as columns, weighted criteria as rows. Score each option per criterion (e.g., 1–5) and note the basis for non-obvious scores.
2. Compute weighted totals, but treat the result as an INPUT to judgment, not an oracle; if two options are within ~10–15%, call it a tie and decide on qualitative grounds.
3. Name sensitivity points (a criterion that decides the outcome) and trade-off points (a property that helps one attribute and hurts another).
4. Do not reverse-engineer scores to a predetermined answer; show the negatives of the recommended option.

Output contract: the matrix (with weighted totals) · sensitivity & trade-off points · an honest recommendation with rationale and conditions under which it would change.
`,
            parameters: [
                {
                    name: 'options',
                    label: 'Options',
                    description: 'The candidate options to compare',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'criteria',
                    label: 'Criteria (with importance)',
                    description: 'Decision criteria and their relative importance/weights',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                options: [
                    'Single Postgres | Postgres + read replica | Postgres + Cassandra read model',
                    'Kafka | RabbitMQ | SQS',
                ],
                criteria: [
                    'write consistency (5), read scalability (4), ops simplicity (5), cost (3), team familiarity (4)',
                ],
            },
            keywords: ['trade-off matrix', 'weighted', 'options', 'criteria', 'decision', 'sensitivity', 'A07'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A07-architecture',
            relatedPromptIds: ['LP-A07-adr', 'LP-C02-weighted-matrix'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
