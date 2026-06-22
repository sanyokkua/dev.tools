import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-C03-breakdown',
    categoryCode: 'C03',
    title: 'Break Down a Task',
    subtitle: 'Decompose a goal into a verifiable work breakdown that covers 100% of scope',
    description: 'Decompose a goal into a verifiable work breakdown that covers 100% of scope',
    variantAxes: [],
    defaultVariantId: 'USR-C03-breakdown',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-C03-breakdown',
            kind: 'user',
            categoryCode: 'C03',
            title: 'Break Down a Task',
            description: 'Break Down a Task',
            template: `Decompose the task/goal below into a clear Work Breakdown Structure (WBS).

Rules:
1. Produce a hierarchy of subtasks where each leaf is small enough to estimate and verify on its own.
2. The subtasks together must cover 100% of the goal (the WBS "100% Rule") — no gaps, minimal overlap. Group related subtasks under headings.
3. For each leaf, note a rough size (S / M / L) and an explicit "done" condition (how you would verify it is complete).
4. Do NOT invent scope beyond the goal. If something is ambiguous, list it as an assumption or a scope question rather than silently expanding the work.

Task / goal:
\`\`\`
{{task}}
\`\`\`

Output: a hierarchical breakdown (grouped subtasks → leaves, each with size + done-condition), then a short **Assumptions** list and any **Scope questions** to resolve.
`,
            parameters: [
                {
                    name: 'task',
                    label: 'Task or goal',
                    description: 'The task or goal to break down, with any known scope/constraints.',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                task: [
                    'Add single sign-on (SSO) login to the web app (we already have email/password auth; need to support Google and Okta).',
                    'Migrate weekly reporting from manual spreadsheets to a self-serve dashboard.',
                ],
            },
            keywords: ['task breakdown', 'WBS', 'subtasks', 'decompose', 'planning', 'C03'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C03-planning',
            relatedPromptIds: ['LP-C03-dependencies', 'LP-C03-estimate'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
