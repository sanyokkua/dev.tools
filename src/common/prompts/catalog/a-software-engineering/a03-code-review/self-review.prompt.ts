import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A03-self-review',
    categoryCode: 'A03',
    title: 'Self-Review Before a Pull Request (PR)',
    subtitle: 'Catch problems in your own change before opening a PR',
    description: 'Catch problems in your own change before opening a PR',
    variantAxes: [],
    defaultVariantId: 'USR-A03-review-selfReview',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A03-review-selfReview',
            kind: 'user',
            categoryCode: 'A03',
            title: 'Self-Review Before a Pull Request (PR)',
            description: 'Self-Review Before a Pull Request (PR)',
            template: `You are helping an author self-review their own {{language}} change before they open a Pull Request (PR). Be a constructive first reviewer who catches problems early.

Change:
\`\`\`
{{code}}
\`\`\`

Do the following:
1. Flag correctness risks, missing edge cases, and missing/weak tests.
2. Point out anything a reviewer is likely to question (unclear naming, over-complex logic, missing error handling, security/performance concerns).
3. Suggest what the PR description should explain (the why, the testing done, any follow-ups).
4. Note anything that should be split into a separate change to keep the PR small and focused.

Output contract:
1. Must-fix-before-PR items.
2. Likely reviewer questions (pre-empt them).
3. Suggested PR-description points.
4. Optional follow-ups / things to split out.

Worked example —
Input language: "TypeScript"; code: a feature change that also reformats an unrelated file and adds a TODO with no test.
Expected (excerpt): Must-fix: add a test for the new branch; revert the unrelated reformat (keeps the diff reviewable). Likely questions: "why the new dependency?" Suggested PR points: motivation, manual test steps. Split out: the reformat into its own commit/PR.
`,
            parameters: [
                {
                    name: 'language',
                    label: 'Programming language',
                    description: 'Language of the change',
                    control: 'select',
                    optional: false,
                    valueSetId: 'programming-language',
                },
                {
                    name: 'code',
                    label: 'Your change (diff or snippet)',
                    description: "The author's diff or snippet",
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: { code: ["<the author's feature change before submitting>"] },
            keywords: ['self-review', 'pre-PR', 'pull request', 'author', 'readiness', 'A03'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A03-code-review',
            relatedPromptIds: ['LP-A08-pr', 'LP-A03-review-change'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
