import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-C01-how-might-we',
    categoryCode: 'C01',
    title: 'Reframe as "How Might We" Questions',
    subtitle: 'Turn a problem or insight into well-scoped How Might We (HMW) questions',
    description: 'Turn a problem or insight into well-scoped How Might We (HMW) questions',
    variantAxes: [],
    defaultVariantId: 'USR-C01-how-might-we',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-C01-how-might-we',
            kind: 'user',
            categoryCode: 'C01',
            title: 'Reframe as "How Might We" Questions',
            description: 'Reframe as "How Might We" Questions',
            template: `Reframe the problem or insight below into a set of "How Might We (HMW)" questions suitable for ideation.

What makes a good HMW (per Min Basadur's original framing): "How" presumes a solution exists; "might" gives permission to propose things that may fail; "we" signals collaboration. Each question must hit the sweet spot:
- NOT too broad — "How might we improve onboarding?" is unactionable.
- NOT solution-baked — "How might we build an SMS-fallback app?" smuggles the answer in.
- Grounded in the actual problem/insight below, not invented.

Produce 3–6 HMW questions that attack the problem from different angles:
- Remove the obstacle (HMW eliminate the friction point?).
- Amplify the good (HMW make the part that works happen more?).
- Explore the opposite / question the assumption (HMW flip the constraint that everyone takes as fixed?).
- Change who or when (HMW solve this for a different actor or moment?).

Problem / insight:
\`\`\`
{{problemOrInsight}}
\`\`\`

Output: a numbered list of 3–6 HMW questions, each one line. After the list, name the single question that looks most promising to ideate on first, and say in one sentence why.
`,
            parameters: [
                {
                    name: 'problemOrInsight',
                    label: 'Problem or insight',
                    description: 'The problem statement or research insight to reframe.',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                problemOrInsight: [
                    'Users abandon signup at the SMS-verification step on poor connections.',
                    'Support tickets spike every Monday morning; most are password resets after the weekend.',
                ],
            },
            keywords: ['How Might We', 'HMW', 'reframe', 'problem framing', 'ideation', 'C01'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C01-ideation',
            relatedPromptIds: ['LP-C01-generate-ideas', 'LP-C01-scamper'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
