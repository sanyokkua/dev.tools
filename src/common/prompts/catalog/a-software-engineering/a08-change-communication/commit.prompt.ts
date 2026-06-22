import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A08-commit',
    categoryCode: 'A08',
    title: 'Write a Commit Message',
    subtitle: 'A Conventional Commit from a change summary or diff',
    description: 'A Conventional Commit from a change summary or diff',
    variantAxes: [],
    defaultVariantId: 'USR-A08-change-commit',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A08-change-commit',
            kind: 'user',
            categoryCode: 'A08',
            title: 'Write a Commit Message',
            description: 'Write a Commit Message',
            template: `You are an engineering communication editor. Write a Conventional Commit message for the change below.

Change summary or diff:
\`\`\`
{{changeSummary}}
\`\`\`

Rules:
1. Format: \`<type>[optional scope]: <description>\` — imperative mood, subject ≤ ~50 chars, no trailing period. Types: \`feat\`, \`fix\`, \`docs\`, \`refactor\`, \`perf\`, \`test\`, \`build\`, \`ci\`, \`chore\`. Use \`!\` or a \`BREAKING CHANGE:\` footer for breaking changes.
2. Subject = what changed (imperative). Body (wrap ~72) = what and WHY, not how. Add a footer for issue references only if present in the input.
3. Use only facts from the input; do not invent ticket numbers or rationale that isn't supported.

Output contract: ONLY the commit message (subject + blank line + body + optional footer), in a plain code block.

Worked example —
Input: "fixed the redirect loop when a token expires by guarding re-entry in session middleware"
Expected output:
\`\`\`
fix(auth): prevent redirect loop on expired token

Guard re-entry in the session middleware so an expired token no longer
triggers an infinite redirect to the login page.
\`\`\`
`,
            parameters: [
                {
                    name: 'changeSummary',
                    label: 'Change summary or diff',
                    description: 'A summary of the change or the diff itself',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                changeSummary: [
                    'fixed the redirect loop when a token expires by guarding re-entry in session middleware',
                    'added webhook support for publish events',
                ],
            },
            keywords: ['commit message', 'conventional commits', 'what why', 'imperative', 'semver', 'A08'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A08-change-communication',
            relatedPromptIds: ['LP-A08-pr', 'AGT-A08-commit-and-pr'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
