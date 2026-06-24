import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A05-test-strategy',
    categoryCode: 'A05',
    title: 'Design a Test Strategy',
    subtitle: 'A pragmatic, risk-based test plan choosing levels by risk',
    description: 'A pragmatic, risk-based test plan choosing levels by risk',
    variantAxes: [],
    defaultVariantId: 'USR-A05-test-strategy',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A05-test-strategy',
            kind: 'user',
            categoryCode: 'A05',
            title: 'Design a Test Strategy',
            description: 'Design a Test Strategy',
            template: `You are a test engineer. Propose a pragmatic test strategy for the feature/system below.

Subject:
\`\`\`
{{featureOrSystem}}
\`\`\`

Cover:
1. What to test at each level — unit (isolated logic), integration (components together), contract (service boundaries), end-to-end (key user journeys) — and roughly the proportion, justified by risk and cost (the test pyramid: many unit, fewer integration, fewest end-to-end).
2. The highest-risk areas that deserve the most testing.
3. Mocking boundaries (mock external Input/Output, not internal logic).
4. Non-functional tests if relevant (performance, security, accessibility).
5. What NOT to over-test (avoid brittle, low-value tests).

Output contract: a concise strategy — Test levels & focus · High-risk areas · Mocking boundaries · Non-functional considerations · Anti-over-testing notes. Keep it actionable, not academic.
`,
            parameters: [
                {
                    name: 'featureOrSystem',
                    label: 'Feature or system',
                    description:
                        'The feature or system to design a test strategy for, with any known risks/constraints',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                featureOrSystem: [
                    'A payment-processing service integrating a third-party gateway',
                    'A new search feature over an existing product catalog',
                ],
            },
            keywords: ['test strategy', 'test plan', 'test pyramid', 'levels', 'risk-based', 'A05'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A05-testing',
            relatedPromptIds: ['LP-A05-edge-cases', 'LP-A05-generate-tests'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
