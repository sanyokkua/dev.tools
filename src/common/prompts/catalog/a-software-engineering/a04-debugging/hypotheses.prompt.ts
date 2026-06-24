import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A04-hypotheses',
    categoryCode: 'A04',
    title: 'Generate Root-Cause Hypotheses',
    subtitle: 'Ranked, testable hypotheses for a hard-to-pin bug',
    description: 'Ranked, testable hypotheses for a hard-to-pin bug',
    variantAxes: [],
    defaultVariantId: 'USR-A04-debug-hypotheses',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A04-debug-hypotheses',
            kind: 'user',
            categoryCode: 'A04',
            title: 'Generate Root-Cause Hypotheses',
            description: 'Generate Root-Cause Hypotheses',
            template: `You are a debugging specialist. For the symptom and context below, generate ranked, testable hypotheses for the root cause.

Symptom:
\`\`\`
{{symptom}}
\`\`\`

Context (system, recent changes, environment, frequency):
\`\`\`
{{context}}
\`\`\`

Rules:
1. Produce 3–5 distinct hypotheses, ordered most → least likely given the evidence.
2. For each: the proposed cause, why it fits the symptom, and a concrete cheap test to confirm or rule it out (a command, a log to add, an input to try, a bisection).
3. Favor hypotheses that are cheap to test and high-information. Note what evidence would most quickly narrow the field.

Output contract: a ranked list — Hypothesis · Why plausible · How to test (confirm/refute). End with the single most informative next experiment.
`,
            parameters: [
                {
                    name: 'symptom',
                    label: 'Symptom',
                    description: 'The observed failure/behavior',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'context',
                    label: 'Context',
                    description: 'System details, recent changes, environment, and how often it happens',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                symptom: [
                    'Checkout occasionally charges twice',
                    'Service memory grows until out-of-memory (OOM) after ~6 hours',
                ],
                context: ['Mobile clients on flaky networks; retries enabled; deployed last Tuesday'],
            },
            keywords: ['hypotheses', 'root cause', 'ranked', 'testable', 'isolate', 'experiment', 'A04'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A04-debugging',
            relatedPromptIds: ['LP-A04-diagnose'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
