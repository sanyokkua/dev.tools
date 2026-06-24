import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A08-release-notes',
    categoryCode: 'A08',
    title: 'Write Release Notes',
    subtitle: 'User-facing release notes in plain language for an audience',
    description: 'User-facing release notes in plain language for an audience',
    variantAxes: [],
    defaultVariantId: 'USR-A08-change-releaseNotes',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A08-change-releaseNotes',
            kind: 'user',
            categoryCode: 'A08',
            title: 'Write Release Notes',
            description: 'Write Release Notes',
            template: `You are an engineering communication editor. Write user-facing release notes for the changes below, addressed to {{audience}}.

Changes:
\`\`\`
{{changes}}
\`\`\`

Rules:
1. Write in plain, benefit-oriented language for {{audience}} — describe what users can now do or what improved, not internal implementation. Lead with the most impactful items.
2. Group sensibly (e.g., New, Improved, Fixed). Translate jargon; one change may merge several commits.
3. Be honest and specific; do not overstate. Use only facts from the input; mark unknowns as "TODO".

Output contract: ONLY the release notes in Markdown, with a short intro line and grouped highlights.
`,
            parameters: [
                {
                    name: 'changes',
                    label: 'Changes shipping',
                    description: 'The changes shipping in this release',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'audience',
                    label: 'Audience',
                    description: 'Who the notes are for (end users, developers/integrators, internal stakeholders)',
                    control: 'text',
                    optional: false,
                },
            ],
            examples: {
                changes: ['webhook support; faster search; timezone fix for email; security patch'],
                audience: ['End users', 'Developers / API integrators'],
            },
            keywords: ['release notes', 'user-facing', 'highlights', 'plain language', 'audience', 'A08'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A08-change-communication',
            relatedPromptIds: ['LP-A08-changelog'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
