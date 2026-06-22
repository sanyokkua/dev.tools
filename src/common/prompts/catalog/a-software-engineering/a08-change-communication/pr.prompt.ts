import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A08-pr',
    categoryCode: 'A08',
    title: 'Write a Pull Request (PR) Description',
    subtitle: 'A PR description (what/why/testing) — chat + repository-aware agent twin',
    description: 'A PR description (what/why/testing) — chat + repository-aware agent twin',
    variantAxes: ['mode'],
    defaultVariantId: 'USR-A08-change-pr',
    modeClass: 'dual',
    variants: [
        {
            id: 'USR-A08-change-pr',
            kind: 'user',
            categoryCode: 'A08',
            title: 'Write a Pull Request (PR) Description',
            description: 'Write a Pull Request (PR) Description',
            template: `You are an engineering communication editor. Write a clear Pull Request (PR) description for the change below.

Change summary (or an existing rough PR description to improve):
\`\`\`
{{changeSummary}}
\`\`\`

Produce:
1. **What & why** — what the change does and the motivation (the problem it solves). Focus on what/why, not a line-by-line how.
2. **Changes** — a short bullet list of the notable changes (user-visible or structural).
3. **Testing** — how it was verified (tests added/run, manual steps), and a screenshots placeholder if UI.
4. **Notes for reviewers** — anything to focus on, risks, or follow-ups.
5. **Linked issues** — only if present in the input.

Rules: concise, semi-formal, professional. Use only facts from the input; mark unknowns as "TODO". Do not invent ticket numbers or test results.

Output contract: ONLY the PR description in Markdown.

Worked example —
Input: "adds email notifications on order shipment, with fallback template; new POST /notifications/email"
Expected output: \`## What & why\` ("Customers weren't notified when orders shipped; this adds an email on shipment."), \`## Changes\` (bullets: new \`POST /notifications/email\`, fallback template, hook into the shipment event), \`## Testing\` ("unit tests for the notifier; manual: shipped a test order and confirmed the email — TODO: add an integration test"), \`## Notes for reviewers\` ("template fallback path is the riskiest part").
`,
            parameters: [
                {
                    name: 'changeSummary',
                    label: 'Change summary (or rough PR to improve)',
                    description: 'Summary of the change (or an existing PR description to refine)',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                changeSummary: [
                    'adds email notifications on order shipment, with fallback template; new POST /notifications/email',
                    'refactor: extract validation from the order handler; no behavior change',
                ],
            },
            keywords: ['pull request', 'PR description', 'what why testing', 'review', 'A08'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A08-change-communication',
            relatedPromptIds: ['LP-A03-self-review', 'LP-A08-commit'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'AGT-A08-commit-and-pr',
            kind: 'agent',
            categoryCode: 'A08',
            title: 'Agent: Write a Pull Request (PR) Description',
            description: 'Write a Pull Request (PR) Description',
            template: `You are an engineering communication editor working as an autonomous agent INSIDE the repository at \`{{repo_path}}\`. Produce a commit message and a Pull Request (PR) description from the ACTUAL changes ({{user_intent}}; default both).

Workflow:
1. Read the diff: staged changes (or working changes vs \`{{base_ref}}\`). Understand WHAT changed and infer WHY from the code, related issues, and existing commit style in the repo. Cite real files.
2. Detect the repo's conventions (Conventional Commits? changelog format? PR template?) by reading recent commits and any PR/issue templates. Match them.
3. Produce:
   - A **commit message**: \`<type>[scope]: <subject>\` (imperative, ≤~50 chars) + body (what & why, wrap ~72) + footer (issue refs only if discoverable). Use \`feat/fix/docs/refactor/perf/test/build/ci/chore\`; \`!\` / \`BREAKING CHANGE:\` for breaks.
   - A **PR description**: What & why · Changes (bullets) · Testing (what was run/should be run) · Notes for reviewers · Linked issues (only if found).
4. Do NOT commit, push, or open the PR yourself — output the text for the user to use, unless explicitly instructed to commit.

Constraints: describe what+why, never how; use only facts derivable from the diff/repo (no invented tickets, impact, or test results); match repo conventions.

Output: the commit message (code block) and the PR description (Markdown), plus a one-line note of the conventions detected. End with \`CHANGECOMMS_COMPLETE\`.
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
                    description:
                        'Base to diff against for the PR (branch/commit). Default = staged changes, else default branch',
                    control: 'text',
                    optional: true,
                },
                {
                    name: 'user_intent',
                    label: 'What to produce',
                    description: 'Optional — "commit message only", "PR only", or "both" (default)',
                    control: 'text',
                    optional: true,
                },
            ],
            examples: { base_ref: ['main'], user_intent: ['both', 'PR description only'] },
            keywords: [
                'agent',
                'repository',
                'commit message',
                'PR description',
                'diff',
                'conventional commits',
                'A08',
            ],
            executionContext: 'agent',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A08-change-communication',
            relatedPromptIds: ['LP-A03-self-review', 'LP-A08-commit'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
