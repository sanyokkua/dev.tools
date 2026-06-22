import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A08-changelog',
    categoryCode: 'A08',
    title: 'Write a Changelog',
    subtitle: '"Keep a Changelog"–style entries from a list of changes',
    description: '"Keep a Changelog"–style entries from a list of changes',
    variantAxes: [],
    defaultVariantId: 'USR-A08-change-changelog',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A08-change-changelog',
            kind: 'user',
            categoryCode: 'A08',
            title: 'Write a Changelog',
            description: 'Write a Changelog',
            template: `You are an engineering communication editor. Turn the changes below into changelog entries following the "Keep a Changelog" convention.

Changes:
\`\`\`
{{changes}}
\`\`\`

Rules:
1. Group entries under the standard headings, using only those that apply: **Added, Changed, Deprecated, Removed, Fixed, Security**.
2. Write for humans: each entry is a concise, user-meaningful sentence (the noticeable difference), not a raw commit subject. Merge related commits into one entry.
3. Put new work under an \`## [Unreleased]\` section (newest first). Do not invent version numbers or dates.
4. Use only facts from the input; omit internal-only noise.

Output contract: ONLY the changelog section in Markdown.

Worked example —
Input: "added webhook support; fixed timezone bug in email notifications; patched XSS in comments"
Expected output:
\`\`\`
## [Unreleased]
### Added
- Webhook support for event subscriptions.
### Fixed
- Email notifications now use the correct timezone.
### Security
- Fixed a cross-site scripting (XSS) vulnerability in comments.
\`\`\`
`,
            parameters: [
                {
                    name: 'changes',
                    label: 'Changes',
                    description: 'The list of changes (commits, PR titles, or notes) to compile',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                changes: [
                    'added webhook support; fixed timezone bug in email notifications; patched XSS in comments',
                    'removed deprecated /v1/legacy endpoint; improved search performance',
                ],
            },
            keywords: ['changelog', 'keep a changelog', 'added changed fixed', 'unreleased', 'A08'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A08-change-communication',
            relatedPromptIds: ['LP-A08-release-notes', 'LP-A08-commit'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
