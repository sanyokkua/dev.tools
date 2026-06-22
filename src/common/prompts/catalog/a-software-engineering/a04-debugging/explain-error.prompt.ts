import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A04-explain-error',
    categoryCode: 'A04',
    title: 'Explain an Error or Stack Trace',
    subtitle: 'Decode what an error means and where to look next',
    description: 'Decode what an error means and where to look next',
    variantAxes: [],
    defaultVariantId: 'USR-A04-debug-explainError',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A04-debug-explainError',
            kind: 'user',
            categoryCode: 'A04',
            title: 'Explain an Error or Stack Trace',
            description: 'Explain an Error or Stack Trace',
            template: `You are a debugging specialist. Explain the {{language}} error/stack trace below so the developer understands what it means and where to look.

Error / stack trace:
\`\`\`
{{error}}
\`\`\`

Do the following:
1. State plainly what the error type and message mean.
2. Identify the first frame in the developer's own code (versus library frames) and explain what likely triggered it.
3. List the most common causes of this error in this context, ordered by likelihood.
4. Give the next diagnostic checks to confirm the cause (commands, log points, or inspections).

Output contract: **What it means** · **Where it originates** · **Likely causes (ranked)** · **Next checks**. Do not fabricate code that wasn't shown; if the trace is truncated, say what additional context would help.

Worked example —
Input language: "Java 21"; error: "java.lang.NullPointerException at com.example.OrderService.process(OrderService.java:42)"
Expected output: What it means — a null reference was dereferenced. Where it originates — \`OrderService.process\` line 42 (your code, not a library). Likely causes (ranked) — (1) a field/parameter expected non-null was null (e.g., a lookup returned null); (2) an uninitialized dependency. Next checks — inspect line 42 to see which reference; add a null check or log the inputs; confirm the upstream lookup populates the value.
`,
            parameters: [
                {
                    name: 'language',
                    label: 'Programming language / runtime',
                    description: 'Language/runtime of the error',
                    control: 'select',
                    optional: false,
                    valueSetId: 'programming-language',
                },
                {
                    name: 'error',
                    label: 'Error / stack trace',
                    description: 'The error message and/or stack trace',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                error: [
                    'java.lang.NullPointerException at com.example.OrderService.process(OrderService.java:42)',
                    '<a Python traceback ending in KeyError>',
                ],
            },
            keywords: ['error', 'stack trace', 'explain', 'exception', 'causes', 'A04'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A04-debugging',
            relatedPromptIds: ['LP-A04-diagnose', 'LP-A04-hypotheses'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
