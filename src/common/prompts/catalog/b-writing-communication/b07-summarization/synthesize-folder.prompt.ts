import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-B07-synthesize-folder',
    categoryCode: 'B07',
    title: 'Synthesize a Folder into One Brief',
    subtitle: 'Agent twin — integrate many files into one coherent output, not per-file summaries.',
    description: 'Agent twin — integrate many files into one coherent output, not per-file summaries.',
    variantAxes: [],
    defaultVariantId: 'AGT-B07-synthesize-folder',
    modeClass: 'agent-only',
    variants: [
        {
            id: 'AGT-B07-synthesize-folder',
            kind: 'agent',
            categoryCode: 'B07',
            title: 'Synthesize a Folder into One Brief',
            description: 'Synthesize a Folder into One Brief',
            template: `You are an editor working as an autonomous agent over the folder at \`{{folder_path}}\`. Synthesize the relevant files into ONE coherent output.

What to produce: {{output_kind}}
Subset of files (blank = all relevant): {{target_paths}}

Workflow:
1. INVENTORY and read the relevant files in scope. Do not assume contents — read the real files.
2. SYNTHESIZE, do not just summarize: integrate information ACROSS the files into unified findings/themes, noting where sources agree, disagree, or leave gaps. (Summarizing each file separately is NOT the goal.)
3. ATTRIBUTE key claims to their source file so the synthesis is traceable.
4. PRODUCE the requested output, leading with the bottom line. Base everything strictly on the files; do NOT add external facts. Flag conflicts and gaps.
5. If asked, WRITE it to a file; otherwise return it.

Constraints: synthesis across sources (not per-file summaries); strictly source-based; conflicts/gaps surfaced; claims traceable.

Output: the synthesized {{output_kind}}, with a short source list and any conflicts/gaps noted. End with the line \`SYNTHESIS_COMPLETE\`.
`,
            parameters: [
                { name: 'folder_path', control: 'text', optional: false, label: 'Folder of files to synthesize' },
                {
                    name: 'output_kind',
                    control: 'select',
                    optional: false,
                    label: 'Deliverable',
                    description: 'executive brief | combined summary | cross-document themes.',
                    valueSetId: 'synthesis-output-kind',
                },
                {
                    name: 'target_paths',
                    control: 'text',
                    optional: true,
                    label: 'Subset of files (optional)',
                    description: 'Specific files to include; blank = all relevant.',
                },
            ],
            examples: {
                folder_path: ['./research', '~/notes/project-x'],
                output_kind: ['executive brief', 'cross-document themes'],
                target_paths: ['the three vendor evaluation docs', ''],
            },
            keywords: ['agent', 'folder', 'synthesize', 'multi-file', 'executive brief', 'themes', 'B07'],
            executionContext: 'agent',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-B07-summarization',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
