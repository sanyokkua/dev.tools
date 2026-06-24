import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-C02-compare-solutions',
    categoryCode: 'C02',
    title: 'Compare Technical Solutions',
    subtitle: 'Compare tools/approaches across the dimensions that matter, with an honest recommendation',
    description: 'Compare tools/approaches across the dimensions that matter, with an honest recommendation',
    variantAxes: [],
    defaultVariantId: 'USR-C02-compare-solutions',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-C02-compare-solutions',
            kind: 'user',
            categoryCode: 'C02',
            title: 'Compare Technical Solutions',
            description: 'Compare Technical Solutions',
            template: `Compare the technical options below for the stated context.

Rules:
1. Derive the dimensions that actually matter for THIS context — do not use a generic list. Candidates: fit to requirements, maturity/stability, performance, operability, cost (including operational), ecosystem/support, learning curve, lock-in/exit cost.
2. Compare each option across those dimensions in a table.
3. Be honest about trade-offs and uncertainty. Do NOT present an unproven option as safe; mark where you are inferring versus where there is established evidence.
4. Give a recommendation tied to the context, and state the conditions under which a different option would win.
5. Name what to validate with a spike or proof of concept (POC) before committing — especially for any one-way-door aspect.

Options:
\`\`\`
{{options}}
\`\`\`

Context (requirements, constraints, team, scale):
\`\`\`
{{context}}
\`\`\`

Output: a comparison table (options × the dimensions you chose) · the standout trade-offs · a context-tied recommendation with the conditions that would flip it · what to validate (spike/POC) before committing.
`,
            parameters: [
                {
                    name: 'options',
                    label: 'Technical options',
                    description: 'The solutions/tools to compare.',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'context',
                    label: 'Context (requirements, constraints, team, scale)',
                    description: 'What shapes the decision — requirements, constraints, team, scale.',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                options: [
                    "PostgreSQL vs MongoDB for the new service's primary datastore.",
                    'Next.js vs Remix vs plain React + Vite.',
                ],
                context: [
                    'Small team (3 engineers), mostly relational data, strong consistency needed, moderate scale (~10k writes/day), no existing NoSQL ops experience.',
                    'Content-heavy marketing site, SEO-critical, small team comfortable with React, needs fast first-load.',
                ],
            },
            keywords: ['compare solutions', 'tools', 'technology choice', 'trade-offs', 'recommendation', 'C02'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C02-decision-support',
            relatedPromptIds: ['LP-C02-weighted-matrix', 'LP-C02-pros-cons'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
