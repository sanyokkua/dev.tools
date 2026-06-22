import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-B01-editpass-folder',
    categoryCode: 'B01',
    title: 'Proofreading and Consistency Pass Across a Folder',
    subtitle: 'Agent twin — proofread a folder of documents in place and standardize terms across files.',
    description: 'Agent twin — proofread a folder of documents in place and standardize terms across files.',
    variantAxes: [],
    defaultVariantId: 'AGT-B01-editpass-folder',
    modeClass: 'agent-only',
    variants: [
        {
            id: 'AGT-B01-editpass-folder',
            kind: 'agent',
            categoryCode: 'B01',
            title: 'Proofreading and Consistency Pass Across a Folder',
            description: 'Proofreading and Consistency Pass Across a Folder',
            template: `You are a copy editor working as an autonomous agent over the folder at \`{{folder_path}}\`. Perform a proofreading and consistency pass across the documents there.

Scope (file types or subset, blank = all text documents): {{target_paths}}
Apply mode (blank = apply in place): {{user_intent}}

Workflow:
1. INVENTORY the in-scope documents (e.g. \`*.md\`, \`*.txt\`, \`*.rst\`). Read each one. Do not assume contents — read the real files.
2. PROOFREAD each file: fix grammar, spelling, punctuation, and obvious errors with minimal, meaning-preserving changes. Preserve tone and intent. Do not change technical facts, code blocks, commands, or identifiers.
3. ENFORCE CROSS-FILE CONSISTENCY: detect terms, names, capitalization, and formatting that differ across files (e.g. "log in" vs "login", a product-name spelled two ways, United States (US) vs United Kingdom (UK) spelling). Standardize to the most common correct form. Keep a running list of every convention you settle on.
4. APPLY: if apply mode is in place, edit the real files; if diffs only, produce a unified diff per file and change nothing on disk. For any change that crosses from proofreading into rewriting, leave the file and flag it for the user instead.
5. Do NOT create commits — leave that to the user's Version Control System (VCS) so they can review and revert.

Output: the edited files (or diffs) plus a report containing: files touched, the kinds of fixes made per file, the consistency conventions you standardized on, and anything ambiguous you left for the user. End with the line \`EDITPASS_COMPLETE\`.
`,
            parameters: [
                {
                    name: 'folder_path',
                    control: 'text',
                    optional: false,
                    label: 'Folder of documents',
                    description: 'Path to the folder of documents to proofread (e.g. ./docs).',
                },
                {
                    name: 'target_paths',
                    control: 'text',
                    optional: true,
                    label: 'Scope filter (optional)',
                    description:
                        'File-type or subset filter, e.g. "*.md" or "docs/guides/". Blank = all text documents.',
                },
                {
                    name: 'user_intent',
                    control: 'select',
                    optional: true,
                    label: 'Apply mode',
                    description: 'Apply edits in place (default) or report diffs only.',
                    valueSetId: 'editpass-apply-mode',
                },
            ],
            examples: {
                folder_path: ['./docs', '~/handbook'],
                target_paths: ['*.md', ''],
                user_intent: ['apply in place', 'diffs only'],
            },
            keywords: ['agent', 'folder', 'proofread', 'consistency', 'edit pass', 'multi-file', 'B01'],
            executionContext: 'agent',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-B01-proofreading',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
