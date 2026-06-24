import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A01-from-spec',
    categoryCode: 'A01',
    title: 'Implement Code from a Specification',
    subtitle: 'Implement to acceptance criteria — chat, plus a repository-aware agent twin',
    description: 'Implement to acceptance criteria — chat, plus a repository-aware agent twin',
    variantAxes: ['mode'],
    defaultVariantId: 'USR-A01-codegen-fromSpec',
    modeClass: 'dual',
    variants: [
        {
            id: 'USR-A01-codegen-fromSpec',
            kind: 'user',
            categoryCode: 'A01',
            title: 'Implement Code from a Specification',
            description: 'Implement Code from a Specification',
            template: `You are an experienced {{language}} developer. Implement {{language}} code that satisfies the specification / acceptance criteria below.

Specification:
\`\`\`
{{spec}}
\`\`\`

Rules:
1. Implement exactly what the spec states; satisfy each acceptance criterion. Cover the edge cases the spec implies.
2. Use idiomatic {{language}}, clean structure, input validation, and error handling.
3. Do not add features beyond the spec (You Aren't Gonna Need It — YAGNI). Do not invent libraries or Application Programming Interfaces (APIs).
4. Where the spec is silent on a decision, choose the safest interpretation and record it as an assumption.

Output contract:
1. The implementation in fenced \`\`\`{{language}}\`\`\` block(s), organized sensibly.
2. A mapping of each acceptance criterion → how the code satisfies it.
3. A bullet list of assumptions and any spec ambiguities you resolved.
`,
            parameters: [
                {
                    name: 'language',
                    label: 'Programming language',
                    description: 'Target programming language (and version if relevant)',
                    control: 'select',
                    optional: false,
                    valueSetId: 'programming-language',
                },
                {
                    name: 'spec',
                    label: 'Specification / acceptance criteria',
                    description: 'The specification or acceptance criteria to implement',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                spec: [
                    'GIVEN a cart with items, WHEN checkout is called, THEN apply a 10% discount over $100 and return the final total; reject empty carts.',
                    'Implement a rate limiter: max N requests per window per key; return remaining quota.',
                ],
            },
            keywords: ['implement', 'specification', 'acceptance criteria', 'code generation', 'A01'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A01-code-generation',
            relatedPromptIds: ['LP-A01-function', 'LP-A05-generate-tests', 'AGT-A08-commit-and-pr'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'AGT-A01-implement',
            kind: 'agent',
            categoryCode: 'A01',
            title: 'Agent: Implement Code from a Specification',
            description: 'Implement Code from a Specification',
            template: `You are a senior software engineer working as an autonomous coding agent INSIDE the repository at \`{{repo_path}}\`. Implement the task below by editing files in that repository.

Task:
\`\`\`
{{task}}
\`\`\`

Scope hint (optional — files/areas likely involved): {{target_paths}}

Workflow (follow in order):
1. INSPECT before acting: traverse the repo. Read the project manifest, README, and the files in the scope hint (or search for the relevant ones). Identify the language, framework, conventions, test setup, and existing patterns. Do NOT guess — read the actual code, and cite real file paths you relied on.
2. RESTATE the task in one or two sentences and list assumptions and edge cases you will handle. If a blocking ambiguity exists, state it and proceed with the safest interpretation.
3. PLAN: outline the minimal set of changes and the files you will touch.
4. IMPLEMENT: make the smallest focused change that satisfies the task. Reuse existing helpers, styles, and conventions. Do NOT reformat unrelated code, rename unrelated symbols, or touch files outside the necessary scope. Do not add dependencies unless required — if you must, justify it and confirm it exists in the manifest.
5. TESTS: add or update tests for the new behavior; cover the main path and key edge cases.
6. VERIFY: run the project's build/lint/test commands if available; report results honestly. Do NOT claim tests pass unless they were actually run.

Constraints: minimal, focused diff; no unrelated refactors/renames/reformatting; preserve public behavior unless the task requires changing it; never invent Application Programming Interfaces (APIs) or packages — verify they exist in the repo or its manifest.

Output (a verification summary): files changed (with what changed and why, real paths) · behavior changed · tests added · commands run + actual results · assumptions made · remaining risks/follow-ups. End with the token \`IMPLEMENTATION_COMPLETE\`.
`,
            parameters: [
                {
                    name: 'repo_path',
                    label: 'Repository path',
                    description: 'Path to the repository the agent operates in',
                    control: 'text',
                    optional: false,
                },
                {
                    name: 'task',
                    label: 'Task',
                    description: 'The feature/change to implement',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'target_paths',
                    label: 'Scope hint (files/areas)',
                    description: 'Optional hint of files/directories likely involved (helps scope the search)',
                    control: 'text',
                    optional: true,
                },
            ],
            examples: {
                task: [
                    'Add an email notification when an order ships, reusing the existing notification service.',
                    'Add pagination to the GET /users endpoint.',
                ],
            },
            keywords: ['agent', 'repository', 'implement', 'feature', 'minimal diff', 'verify', 'A01'],
            executionContext: 'agent',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A01-code-generation',
            relatedPromptIds: ['LP-A01-function', 'LP-A05-generate-tests', 'AGT-A08-commit-and-pr'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
