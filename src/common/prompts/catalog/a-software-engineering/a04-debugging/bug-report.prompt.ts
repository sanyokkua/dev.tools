import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A04-bug-report',
    categoryCode: 'A04',
    title: 'Write a Bug Report',
    subtitle: 'Turn rough notes into a clear, reproducible bug report',
    description: 'Turn rough notes into a clear, reproducible bug report',
    variantAxes: [],
    defaultVariantId: 'USR-A04-debug-bugReport',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A04-debug-bugReport',
            kind: 'user',
            categoryCode: 'A04',
            title: 'Write a Bug Report',
            description: 'Write a Bug Report',
            template: `You are a Quality Assurance (QA) / engineering specialist. Turn the rough notes below into a clear, structured bug report a developer can act on.

Notes:
\`\`\`
{{user_text}}
\`\`\`

Produce a report with these sections (omit a section only if the notes truly contain nothing for it, and mark it "Unknown"):
- **Summary** — one line.
- **Environment** — operating system / runtime / version / build or commit if given.
- **Steps to reproduce** — numbered, minimal.
- **Expected result** versus **Actual result** (include the exact error/stack if present).
- **Reproducibility** — always / intermittent (frequency).
- **Scope** — when it started / last known good, if known.
- **Workaround** — if any.
- **Artifacts** — logs/screenshots/reproduction to attach.

Rules: use only facts present in the notes; do not invent steps, versions, or errors. Mark missing-but-important fields as "Unknown — please provide." Redact any secrets.

Output contract: ONLY the structured bug report in Markdown.

Worked example —
Input notes: "search breaks sometimes when you put weird characters, prod only, started after last deploy"
Expected output: a report whose Summary = "Search fails on special characters (production only)", Environment = "Production — Unknown runtime/build", Steps = "1. Open search; 2. Enter a query with special characters (e.g., \`%\` or \`'\`); 3. Submit", Expected = "results or a graceful empty state", Actual = "search breaks (exact error Unknown — please provide)", Reproducibility = "Intermittent ('sometimes')", Scope = "Started after the last deploy".
`,
            parameters: [
                {
                    name: 'user_text',
                    label: 'Rough notes',
                    description: 'Rough notes describing the problem',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                user_text: [
                    'search breaks sometimes when you put weird characters, prod only, started after last deploy',
                    'app crashes on login for some users, see error about token',
                ],
            },
            keywords: ['bug report', 'reproduce', 'steps', 'expected actual', 'environment', 'triage', 'A04'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A04-debugging',
            relatedPromptIds: ['LP-A04-diagnose'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
