import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-C03-dependencies',
    categoryCode: 'C03',
    title: 'Map Dependencies and Sequence Work',
    subtitle: 'Find dependencies, the critical path, and what can run in parallel',
    description: 'Find dependencies, the critical path, and what can run in parallel',
    variantAxes: [],
    defaultVariantId: 'USR-C03-dependencies',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-C03-dependencies',
            kind: 'user',
            categoryCode: 'C03',
            title: 'Map Dependencies and Sequence Work',
            description: 'Map Dependencies and Sequence Work',
            template: `For the subtasks below, identify dependencies and propose an execution order.

Rules:
1. Determine which subtasks must precede others, and state WHY for each dependency (X produces something Y needs).
2. Identify which subtasks can run in parallel (no dependency between them).
3. Identify the critical path — the longest chain of dependent subtasks, which determines the overall timeline.
4. Flag any circular dependencies (A needs B needs A) and any dependency that is unclear and needs resolving.

Subtasks:
\`\`\`
{{subtasks}}
\`\`\`

Output:
1. A **dependency list** (X must precede Y — and why).
2. A **suggested ordering / phases**, with parallelizable groups marked.
3. The **critical path**.
4. **Risks**: bottlenecks, single points of failure, and unclear or circular dependencies to resolve.
`,
            parameters: [
                {
                    name: 'subtasks',
                    label: 'Subtasks',
                    description: 'The list of subtasks (e.g. the leaves from Break Down a Task).',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                subtasks: [
                    'set up identity provider; build login UI; add session storage; write integration tests; deploy to staging; security review; deploy to production',
                    'schema design; data migration script; backfill job; dashboard build; QA; cutover',
                ],
            },
            keywords: ['dependencies', 'sequencing', 'critical path', 'parallel', 'ordering', 'planning', 'C03'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C03-planning',
            relatedPromptIds: ['LP-C03-breakdown', 'LP-C03-estimate'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
