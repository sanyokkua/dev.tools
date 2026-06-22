import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A02-pattern',
    categoryCode: 'A02',
    title: 'Apply a Design Pattern',
    subtitle: 'Refactor by applying (or recommending) a suitable design pattern',
    description: 'Refactor by applying (or recommending) a suitable design pattern',
    variantAxes: [],
    defaultVariantId: 'USR-A02-refactor-pattern',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A02-refactor-pattern',
            kind: 'user',
            categoryCode: 'A02',
            title: 'Apply a Design Pattern',
            description: 'Apply a Design Pattern',
            template: `You are a refactoring specialist. Refactor the {{language}} code below by applying a suitable design pattern, without changing observable behavior.

Code:
\`\`\`
{{code}}
\`\`\`

Pattern (optional — if blank, recommend one): {{pattern}}

Rules:
1. If a pattern is named, apply it only if it genuinely fits; if it does not, say so and propose a better-fitting pattern with reasoning.
2. If no pattern is given, recommend the most appropriate one for the code's problem (Strategy for varying behavior; Factory/Builder for creation; Observer for events; State for state-dependent behavior; Decorator for layered behavior) and justify it briefly.
3. Preserve observable behavior; keep the public interface stable unless the pattern requires a documented change.
4. Do not introduce a pattern where simpler code suffices (avoid pattern over-engineering).

Output contract:
1. The pattern chosen and why it fits.
2. The refactored code in a fenced \`\`\`{{language}}\`\`\` block.
3. A "behavior preserved" note and any trade-offs the pattern introduces.

Worked example —
Input language: "Java 21"; code: a class with a large \`switch(employeeType)\` computing pay; pattern: (blank).
Expected output: chosen pattern "Strategy — pay rules vary by type"; refactored to a \`PayCalculator\` interface with \`HourlyPay\`/\`SalariedPay\`/\`CommissionPay\` implementations selected by a small factory; behavior-preserved note: "same totals for each employee type"; trade-off: "more classes; gains testability and open/closed extension."
`,
            parameters: [
                {
                    name: 'language',
                    label: 'Programming language',
                    description: 'Programming language of the snippet',
                    control: 'select',
                    optional: false,
                    valueSetId: 'programming-language',
                },
                {
                    name: 'code',
                    label: 'Code',
                    description: 'The code to refactor',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'pattern',
                    label: 'Design pattern',
                    description: 'Optional named design pattern to apply; blank = let the model recommend',
                    control: 'text',
                    optional: true,
                },
            ],
            examples: {
                code: ['<a class with a large type-switch computing pay by employee type>'],
                pattern: ['Strategy'],
            },
            keywords: ['design pattern', 'refactor', 'Strategy', 'Factory', 'Observer', 'A02'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A02-code-refactoring',
            relatedPromptIds: ['LP-A02-improve'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
