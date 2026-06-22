import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A03-checklist',
    categoryCode: 'A03',
    title: 'Run a Code-Review Checklist',
    subtitle: 'Repeatable pass/fail review over the standard checklist',
    description: 'Repeatable pass/fail review over the standard checklist',
    variantAxes: [],
    defaultVariantId: 'USR-A03-review-checklist',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A03-review-checklist',
            kind: 'user',
            categoryCode: 'A03',
            title: 'Run a Code-Review Checklist',
            description: 'Run a Code-Review Checklist',
            template: `You are a senior code reviewer. Run the following review checklist against the {{language}} change below and report the status of each item.

Change:
\`\`\`
{{code}}
\`\`\`

Checklist — mark each ✅ pass / ⚠️ concern / ❌ fail / — not applicable, with a one-line reason:
1. Correctness: does it do what it intends, with edge cases handled?
2. Design: sound and not over-engineered (solves today's problem)?
3. Tests: present, meaningful, covering the change and edge cases?
4. Naming & readability: intent-revealing; comments explain WHY?
5. Error handling: failures handled and surfaced appropriately?
6. Security: input validated; no secrets/injection/authorization gaps (where relevant)?
7. Performance: no obvious hot-path or N+1 query issues (where relevant)?
8. Style/consistency: conforms to conventions (defer detail to linters)?

Output contract: the checklist with statuses and reasons, then the top 3 must-fix items and an overall recommendation (approve / approve-with-nits / changes-requested).

Worked example —
Input language: "Python 3.12"; code: a service method that loops over user IDs and issues one DB query per ID, with no input validation.
Expected (excerpt): 1. Correctness ⚠️ — works but no empty-list handling. 6. Security ⚠️ — IDs not validated. 7. Performance ❌ — N+1 queries in the loop; batch into one query. Top must-fix: (a) batch the query, (b) validate IDs, (c) handle empty input. Recommendation: changes-requested.
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
                    label: 'Change (diff or snippet)',
                    description: 'The diff or snippet under review',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: { code: ['<a service method with a DB call and input parsing>'] },
            keywords: ['code review', 'checklist', 'pass fail', 'correctness', 'tests', 'security', 'A03'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A03-code-review',
            relatedPromptIds: ['LP-A03-review-change'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
