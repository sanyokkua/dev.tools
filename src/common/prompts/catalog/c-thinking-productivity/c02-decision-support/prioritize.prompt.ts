import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-C02-prioritize',
    categoryCode: 'C02',
    title: 'Prioritize a Backlog',
    subtitle: 'Rank items with RICE, ICE, WSJF, or MoSCoW — applied correctly, scores treated as relative',
    description: 'Rank items with RICE, ICE, WSJF, or MoSCoW — applied correctly, scores treated as relative',
    variantAxes: [],
    defaultVariantId: 'USR-C02-prioritize',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-C02-prioritize',
            kind: 'user',
            categoryCode: 'C02',
            title: 'Prioritize a Backlog',
            description: 'Prioritize a Backlog',
            template: `Prioritize the items below using the {{method}} model. Apply it correctly:

- **Reach, Impact, Confidence, Effort (RICE)** = (Reach × Impact × Confidence) ÷ Effort. Reach = people/events affected per period; Impact multiplier = Massive 3, High 2, Medium 1, Low 0.5, Minimal 0.25; Confidence as a percentage (High 100%, Medium 80%, Low 50%); Effort in person-months (the divisor).
- **Impact, Confidence, Ease (ICE)** = Impact × Confidence × Ease (lighter; use when Reach is unknown or uniform).
- **Weighted Shortest Job First (WSJF)** = Cost of Delay ÷ Job Size, where Cost of Delay = User/Business value + Time criticality + Risk reduction/opportunity enablement (each on a modified Fibonacci scale: 1, 2, 3, 5, 8, 13, 20). Highest WSJF goes first.
- **Must, Should, Could, Won't (MoSCoW)** = sort into Must have / Should have / Could have / Won't have (this time). Keep Must-haves ≤ ~60% of total effort, reserving contingency.

Rules for score-based methods (RICE, ICE, WSJF):
1. Where an input is not given, propose a reasonable value and mark it clearly as an estimate.
2. Show the inputs and the computed score for every item, then rank high → low.
3. Treat scores within ~15% of each other as ties.
4. State plainly that scores are relative and built on estimates — a structuring aid, not an oracle. Flag low-confidence and strategic/foundational items, which systematically under-score.
Watch for denominator gaming: do not let an item's score be inflated by artificially shrinking Effort or Job Size.

Items:
\`\`\`
{{items}}
\`\`\`

Output: for score-based methods, a table (item · inputs · computed score) ranked high → low; for MoSCoW, the four buckets with the ≤60%-Must check. Then caveats on any low-confidence or strategic items that under-score.
`,
            parameters: [
                {
                    name: 'items',
                    label: 'Items to prioritize',
                    description: 'The backlog/list of items, with any known reach/impact/effort.',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'method',
                    label: 'Prioritization model',
                    description: 'Which model to apply.',
                    control: 'select',
                    optional: false,
                    valueSetId: 'prioritization-model',
                },
            ],
            examples: {
                items: [
                    'Slack integration (reach ~2000/qtr, high impact, ~2 person-months); dashboard widgets (~6000, medium, ~4); performance overhaul (~8000, medium, low confidence, ~5); onboarding checklist (~3000, high, ~1)',
                    'new pricing-page messaging; FAQ section; pricing calculator; EU localization; legal sign-off',
                ],
                method: ['RICE', 'ICE', 'WSJF', 'MoSCoW'],
            },
            keywords: ['prioritize', 'RICE', 'ICE', 'WSJF', 'MoSCoW', 'backlog', 'ranking', 'C02'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C02-decision-support',
            relatedPromptIds: ['LP-C02-weighted-matrix', 'LP-C03-estimate'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
