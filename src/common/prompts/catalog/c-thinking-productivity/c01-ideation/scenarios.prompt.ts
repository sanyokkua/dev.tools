import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-C01-scenarios',
    categoryCode: 'C01',
    title: 'Explore Scenarios for a Feature',
    subtitle: 'Enumerate positive, negative, or edge scenarios for a feature or change',
    description: 'Enumerate positive, negative, or edge scenarios for a feature or change',
    variantAxes: [],
    defaultVariantId: 'USR-C01-scenarios',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-C01-scenarios',
            kind: 'user',
            categoryCode: 'C01',
            title: 'Explore Scenarios for a Feature',
            description: 'Explore Scenarios for a Feature',
            template: `Enumerate {{scenarioType}} scenarios for the feature/change below. Explore broadly and concretely — this is divergent exploration, so do NOT evaluate, fix, or prioritize yet.

Interpret the type:
- If {{scenarioType}} = "positive": the ways the feature succeeds and creates value — who benefits, when, and how.
- If {{scenarioType}} = "negative": the ways it fails, causes harm, is misused, is abused, or produces unintended consequences.
- If {{scenarioType}} = "edge": unusual inputs, boundary conditions, rare states, concurrency/timing corners, and empty/maximum cases that stress the behavior.

Rules:
1. Phrase every scenario as "When …, then …" — a concrete trigger and a concrete result.
2. Group related scenarios under short sub-headings.
3. Cover breadth, not five variations of one case.
4. After the list, mark the 2–3 highest-impact scenarios (do not rank the rest).

Feature / change:
\`\`\`
{{feature}}
\`\`\`

Output: grouped "When …, then …" scenarios of the requested type, with the highest-impact ones marked.
`,
            parameters: [
                {
                    name: 'feature',
                    label: 'Feature or change',
                    description: 'The feature or change to explore.',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'scenarioType',
                    label: 'Scenario type',
                    description: 'Which class of scenarios to enumerate.',
                    control: 'select',
                    optional: false,
                    valueSetId: 'scenario-type',
                },
            ],
            examples: {
                feature: [
                    'Allowing users to schedule posts for a future date/time.',
                    'Adding a bulk-delete button to the records table.',
                ],
                scenarioType: ['positive', 'negative', 'edge'],
            },
            keywords: ['scenarios', 'positive negative edge', 'explore', 'feature', 'ideation', 'C01'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C01-ideation',
            relatedPromptIds: ['LP-C02-root-cause'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
