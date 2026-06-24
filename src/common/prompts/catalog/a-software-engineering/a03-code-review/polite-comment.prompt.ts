import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A03-polite-comment',
    categoryCode: 'A03',
    title: 'Make a Review Comment Constructive',
    subtitle: 'Rewrite a blunt review comment to be courteous while keeping the point',
    description: 'Rewrite a blunt review comment to be courteous while keeping the point',
    variantAxes: [],
    defaultVariantId: 'USR-A03-review-politeComment',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A03-review-politeComment',
            kind: 'user',
            categoryCode: 'A03',
            title: 'Make a Review Comment Constructive',
            description: 'Make a Review Comment Constructive',
            template: `You are an expert at constructive code-review communication. Rewrite the review comment below so it is courteous, collaborative, and clear, while keeping the exact technical point intact.

Comment to rewrite:
\`\`\`
{{user_text}}
\`\`\`

Rules:
1. Critique the code, not the person; remove blame and "you" attacks. Frame as a request, suggestion, or question.
2. Use Conventional Comments style where it helps: a label (suggestion / issue / question / nitpick / praise) and, if useful, (blocking) / (non-blocking).
3. Preserve the technical substance exactly; do not add new technical claims or remove the original concern.
4. Keep it concise. Correct any spelling/grammar.

[[INJECT_RULES]]

Output contract: ONLY the rewritten comment. No preamble or explanation.
`,
            parameters: [
                {
                    name: 'user_text',
                    label: 'Original comment',
                    description: 'The original review comment to make constructive',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: { user_text: ['this function is a mess and way too slow', 'why did you even do it like this'] },
            keywords: ['code review comment', 'polite', 'constructive', 'conventional comments', 'tone', 'A03'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A03-code-review',
            relatedPromptIds: ['LP-A08-pr'],
            relatedSkillIds: [],
            supports: { style: false, tone: true, context: false },
        },
    ],
};
