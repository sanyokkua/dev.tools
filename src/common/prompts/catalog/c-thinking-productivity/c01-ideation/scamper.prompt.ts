import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-C01-scamper',
    categoryCode: 'C01',
    title: 'Improve Something with SCAMPER',
    subtitle: 'Apply the SCAMPER checklist to improve an existing product, process, or feature',
    description: 'Apply the SCAMPER checklist to improve an existing product, process, or feature',
    variantAxes: [],
    defaultVariantId: 'USR-C01-scamper',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-C01-scamper',
            kind: 'user',
            categoryCode: 'C01',
            title: 'Improve Something with SCAMPER',
            description: 'Improve Something with SCAMPER',
            template: `Apply the SCAMPER technique to generate improvement ideas for the existing thing below. SCAMPER is a checklist of seven transformation prompts — Substitute, Combine, Adapt, Modify/Magnify, Put to other use, Eliminate, Reverse/Rearrange (SCAMPER). It is for improving an existing product, process, or feature, not blank-sheet invention.

Run each of the seven prompts and produce 1–3 concrete ideas per letter. Do NOT skip letters that feel inapplicable — those often yield the surprises. Defer all evaluation.

- Substitute — replace a part, material, person, or step with something else.
- Combine — merge it with another feature, step, team, or product.
- Adapt — borrow an approach that works elsewhere and apply it here.
- Modify/Magnify — change scale, form, frequency, or an attribute (bigger, smaller, more often).
- Put to other use — a new use, audience, or context for the same thing.
- Eliminate — remove a part, step, rule, or assumption.
- Reverse/Rearrange — invert the order, the roles, or the direction.

Target (existing product/process/feature):
\`\`\`
{{target}}
\`\`\`

Output: ideas grouped under each of the seven SCAMPER letters (use the letter as a heading), each idea one concrete sentence, no evaluation.
`,
            parameters: [
                {
                    name: 'target',
                    label: 'Existing product, process, or feature',
                    description:
                        'The existing thing to improve (SCAMPER needs something to push against — it is weak for blank-sheet invention).',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                target: [
                    'Our continuous-integration / continuous-delivery (CI/CD) pipeline: a single monolithic build, then test, then a staging deploy, then production.',
                    'The onboarding email sequence: five emails over the first week, same content for every new user.',
                ],
            },
            keywords: ['SCAMPER', 'improve', 'ideation', 'substitute combine adapt', 'technique', 'C01'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C01-ideation',
            relatedPromptIds: ['LP-C01-generate-ideas', 'LP-C02-prioritize'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
