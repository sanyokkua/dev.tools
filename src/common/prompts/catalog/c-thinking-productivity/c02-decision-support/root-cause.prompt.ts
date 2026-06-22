import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-C02-root-cause',
    categoryCode: 'C02',
    title: 'Find the Root Cause',
    subtitle: 'Diagnose a problem with 5 Whys and a fishbone, allowing multiple causes',
    description: 'Diagnose a problem with 5 Whys and a fishbone, allowing multiple causes',
    variantAxes: [],
    defaultVariantId: 'USR-C02-root-cause',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-C02-root-cause',
            kind: 'user',
            categoryCode: 'C02',
            title: 'Find the Root Cause',
            description: 'Find the Root Cause',
            template: `Perform a root-cause analysis of the problem below. Use both techniques, because either alone is too narrow:

- **5 Whys** — ask "why?" iteratively along each causal chain. Ground every step in evidence (state the evidence). Allow the chain to BRANCH: a single "why" can have several valid answers. Stop a chain when a further "why" leaves the system's control. Do not force five steps if four reach a fixable cause.
- **Fishbone (Ishikawa) cause categories** — sort candidate causes into categories to surface multiple parallel contributors. For software/process problems use: People, Process, Tooling/Infrastructure, Data, Environment. (The classic manufacturing "6 Ms" are Machine, Method, Material, Manpower, Measurement, Milieu — adapt as needed.)

Critical rules:
1. Do NOT force a single root cause if several genuinely contribute — the 5 Whys' main weakness is assuming one root cause.
2. For every candidate cause, label it as **evidenced** (supported by a stated fact) or **assumed** (a hypothesis to test).
3. Say what to check to confirm or rule out each leading cause.

Problem:
\`\`\`
{{problem}}
\`\`\`

Output: the **fishbone categories** with candidate causes · the **5-Whys chain(s)** to the most likely root cause(s) · an **evidenced vs assumed** marker on each · recommended **countermeasures** and the **checks** to verify them.
`,
            parameters: [
                {
                    name: 'problem',
                    label: 'Problem or symptom',
                    description: 'The problem/symptom to analyze, with any known facts.',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                problem: [
                    'Checkout conversion dropped 8% last week. No code deploy to checkout; a marketing A/B test launched Monday; a competitor ran a promo the same week.',
                    'The nightly batch job keeps failing intermittently — succeeds ~3 nights in 5, fails with a timeout the rest.',
                ],
            },
            keywords: ['root cause', '5 Whys', 'fishbone', 'Ishikawa', 'problem analysis', 'C02'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C02-decision-support',
            relatedPromptIds: ['LP-C01-scenarios', 'LP-C03-breakdown'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
