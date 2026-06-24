import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A06-explain-code',
    categoryCode: 'A06',
    title: 'Explain Code for Understanding',
    subtitle: "Explain unfamiliar code's purpose, flow, and gotchas",
    description: "Explain unfamiliar code's purpose, flow, and gotchas",
    variantAxes: [],
    defaultVariantId: 'USR-A06-doc-explainCode',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A06-doc-explainCode',
            kind: 'user',
            categoryCode: 'A06',
            title: 'Explain Code for Understanding',
            description: 'Explain Code for Understanding',
            template: `You are a documentation engineer helping someone understand unfamiliar code. Explain the {{language}} code below clearly.

Code:
\`\`\`
{{code}}
\`\`\`

Cover:
1. Purpose: what this code is for, in one or two sentences.
2. Flow: how it works step by step (inputs → processing → outputs), at the right level of detail.
3. Key decisions / non-obvious parts: why certain things are done this way, edge cases handled, dependencies used.
4. Gotchas: anything surprising, risky, or easy to misuse.

Rules: explain only what the code shows; if intent is unclear, say so rather than guessing. Use plain language; avoid restating each line — focus on understanding.

Output contract: a clear explanation (prose + short structure), suitable for a developer new to this code.
`,
            parameters: [
                {
                    name: 'language',
                    label: 'Programming language',
                    description: 'Language of the code',
                    control: 'select',
                    optional: false,
                    valueSetId: 'programming-language',
                },
                {
                    name: 'code',
                    label: 'Code',
                    description: 'The code block to explain',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: { code: ['<a non-trivial algorithm or service method>'] },
            keywords: ['explain code', 'onboarding', 'understand', 'walkthrough', 'flow', 'A06'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A06-code-documentation',
            relatedPromptIds: ['LP-A06-docstrings'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
