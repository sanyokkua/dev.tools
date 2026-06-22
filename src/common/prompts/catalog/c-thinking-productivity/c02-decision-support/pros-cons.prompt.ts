import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-C02-pros-cons',
    categoryCode: 'C02',
    title: 'Weigh Pros and Cons',
    subtitle: 'Structured pros/cons for one or more options, with a reversibility check',
    description: 'Structured pros/cons for one or more options, with a reversibility check',
    variantAxes: [],
    defaultVariantId: 'USR-C02-pros-cons',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-C02-pros-cons',
            kind: 'user',
            categoryCode: 'C02',
            title: 'Weigh Pros and Cons',
            description: 'Weigh Pros and Cons',
            template: `Lay out a structured pros/cons analysis for the option(s) below.

Rules:
1. For each option, list the genuine advantages (Pros) and disadvantages (Cons) as concise bullets — real trade-offs, not filler.
2. Mark any pro or con that is especially significant (could decide the matter on its own).
3. Judge reversibility: state whether this looks like a reversible "two-way door" decision (cheap to undo → decide quickly) or an irreversible "one-way door" (deserves deliberation).
4. End with a balanced read of the central trade-off — but leave the final call to the user. Do not pretend one option is risk-free.

Option(s):
\`\`\`
{{options}}
\`\`\`

Output: per option, **Pros** and **Cons** (concise bullets, significant ones marked), then a short **Trade-off** note and a one-line **Reversibility** verdict.
`,
            parameters: [
                {
                    name: 'options',
                    label: 'Option(s)',
                    description: 'One or more options to weigh, plus any context.',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                options: [
                    'Adopt a monorepo for our three backend services (currently three separate repos with shared internal libraries).',
                    'Option A: build the billing engine in-house vs Option B: integrate a vendor (Stripe Billing).',
                ],
            },
            keywords: ['pros cons', 'trade-off', 'decision', 'weigh options', 'reversible', 'C02'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C02-decision-support',
            relatedPromptIds: ['LP-C02-weighted-matrix', 'LP-C02-compare-solutions'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
