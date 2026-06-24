import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A03-review-change',
    categoryCode: 'A03',
    title: 'Review a Code Change',
    subtitle: 'Structured findings for a diff/snippet — chat + repository-aware agent twin',
    description: 'Structured findings for a diff/snippet — chat + repository-aware agent twin',
    variantAxes: ['mode'],
    defaultVariantId: 'USR-A03-review-change',
    modeClass: 'dual',
    variants: [
        {
            id: 'USR-A03-review-change',
            kind: 'user',
            categoryCode: 'A03',
            title: 'Review a Code Change',
            description: 'Review a Code Change',
            template: `You are a senior code reviewer. Review the {{language}} change below and return actionable findings. Your aim is to improve overall code health, not to demand perfection.

Change (diff or snippet):
\`\`\`
{{code}}
\`\`\`

Review for, in priority order: design & correctness; functionality; unnecessary complexity / over-engineering; tests; naming; comments (do they explain WHY?); and — where relevant — security, concurrency, performance. Defer pure style to linters.

Rules:
1. Critique the code, not the author; frame as requests/questions; ground feedback in facts/principles.
2. Be specific: cite the location, the issue, why it matters, and a concrete fix.
3. Mark each finding blocking / non-blocking / nit.

Output contract: numbered findings — **[area] title** · Location · Why · Suggested change (small example if helpful) · severity. Then a top-issues summary and an overall recommendation (approve / approve-with-nits / changes-requested).
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
                    description: 'The diff or code snippet under review',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: { code: ['<a diff adding an HTTP handler and a DB query>'] },
            keywords: ['code review', 'diff', 'findings', 'correctness', 'security', 'severity', 'A03'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A03-code-review',
            relatedPromptIds: ['LP-A03-checklist'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'AGT-A03-review-changes',
            kind: 'agent',
            categoryCode: 'A03',
            title: 'Agent: Review a Code Change',
            description: 'Review a Code Change',
            template: `You are a senior code reviewer working as an autonomous agent INSIDE the repository at \`{{repo_path}}\`. Review the changes against \`{{base_ref}}\` (default: the default branch / last commit). This is a READ-ONLY review — do not modify code.

Optional review focus: {{user_intent}}

Workflow:
1. Determine the changed files (diff vs \`{{base_ref}}\`). Read each change AND enough surrounding context (callers, tests, related modules) to judge correctness — do not review the diff in isolation. Cite real file:line references.
2. Evaluate, in priority order: design & correctness; functionality; unnecessary complexity; tests (present and meaningful?); naming; comments (explain WHY?); and security/concurrency/performance where relevant. Cross-check that the change is consistent with the rest of the repo (no broken callers, no contradicted invariants).
3. Defer pure style to linters. Critique the code, not the author; ground each point in a reason.

Output: a review report —
- **Summary** and overall recommendation (approve / approve-with-nits / changes-requested).
- **Findings**, numbered: \`[area] title\` · file:line · why it matters · suggested change · severity (blocking / non-blocking / nit).
- **Cross-reference checks**: callers/tests affected, anything the change breaks or leaves inconsistent.
End with \`REVIEW_COMPLETE\`. Do not edit files.
`,
            parameters: [
                {
                    name: 'repo_path',
                    label: 'Repository path',
                    description: 'Path to the repository',
                    control: 'text',
                    optional: false,
                },
                {
                    name: 'base_ref',
                    label: 'Base reference to diff against',
                    description: 'Branch, tag, or commit to diff against. Default = default branch / last commit',
                    control: 'text',
                    optional: true,
                },
                {
                    name: 'user_intent',
                    label: 'Review focus',
                    description: 'Optional focus (e.g., "focus on security", "is this safe to merge?")',
                    control: 'text',
                    optional: true,
                },
            ],
            examples: { base_ref: ['main', 'HEAD~1'], user_intent: ['Focus on security and error handling'] },
            keywords: ['agent', 'repository', 'code review', 'diff', 'working changes', 'read-only', 'A03'],
            executionContext: 'agent',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A03-code-review',
            relatedPromptIds: ['LP-A03-checklist'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
