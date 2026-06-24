import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-C03-estimate',
    categoryCode: 'C03',
    title: 'Estimate Effort (Three-Point / PERT)',
    subtitle: 'Optimistic/likely/pessimistic estimates with ranges, countering the planning fallacy',
    description: 'Optimistic/likely/pessimistic estimates with ranges, countering the planning fallacy',
    variantAxes: [],
    defaultVariantId: 'USR-C03-estimate',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-C03-estimate',
            kind: 'user',
            categoryCode: 'C03',
            title: 'Estimate Effort (Three-Point / PERT)',
            description: 'Estimate Effort (Three-Point / PERT)',
            template: `Produce effort estimates for the tasks below using three-point (Program Evaluation and Review Technique, PERT) estimation.

Method (follow exactly):
1. For each task give three estimates: Optimistic (O), Most Likely (M), and Pessimistic (P).
2. Compute the time-expected estimate TE = (O + 4M + P) / 6 (the beta-distribution weighting).
3. Give a rough range per task (a simple standard-deviation proxy is SD = (P − O) / 6).
4. Sum the TE values for a project total, and give a total range.

Honesty rules:
- Treat all estimates as ranges, NOT commitments or promises.
- Counter the planning fallacy: explicitly take the outside view — how has similar work actually gone? — instead of estimating only bottom-up from the best case.
- For each task, name what could make it run long.
- State the unit (hours / days / story points) and the biggest sources of uncertainty.

Tasks:
\`\`\`
{{tasks}}
\`\`\`

Output: a table (task · O · M · P · TE) · the project total with a range · key **Assumptions** · the top **Risks** that could blow the estimate · a one-line reminder that these are estimates, not promises.
`,
            parameters: [
                {
                    name: 'tasks',
                    label: 'Tasks to estimate',
                    description: 'The tasks to estimate, with any known size/context.',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                tasks: [
                    'implement login UI; integrate identity provider; write integration tests; deploy',
                    'data migration from the legacy database (unknown data-quality issues likely)',
                ],
            },
            keywords: ['estimate', 'PERT', 'three-point', 'effort', 'ranges', 'planning fallacy', 'C03'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C03-planning',
            relatedPromptIds: ['LP-C03-breakdown', 'LP-C02-prioritize'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
