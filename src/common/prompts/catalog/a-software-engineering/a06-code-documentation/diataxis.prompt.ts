import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A06-diataxis',
    categoryCode: 'A06',
    title: 'Reshape Content into a Diátaxis Mode',
    subtitle: 'Rewrite mixed content into one documentation mode',
    description: 'Rewrite mixed content into one documentation mode',
    variantAxes: [],
    defaultVariantId: 'USR-A06-doc-diataxis',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A06-doc-diataxis',
            kind: 'user',
            categoryCode: 'A06',
            title: 'Reshape Content into a Diátaxis Mode',
            description: 'Reshape Content into a Diátaxis Mode',
            template: `You are a documentation engineer. Reshape the content below into a single Diátaxis documentation mode: {{mode}}.

Content:
\`\`\`
{{user_text}}
\`\`\`

Apply the chosen mode strictly:
- **Tutorial** (learning-oriented): a guided, ordered lesson a beginner can follow to a successful outcome; concrete steps, stated result.
- **How-to guide** (task-oriented): numbered steps to accomplish a specific goal for someone who already knows the basics.
- **Reference** (information-oriented): factual, structured description; no narrative or opinion.
- **Explanation** (understanding-oriented): the why/background, context and trade-offs; no step-by-step.

Rules: produce ONLY the chosen mode — do not mix modes. Use only information present in the content; mark gaps as "TODO: confirm". Match tone to the mode.

Output contract: the content rewritten in {{mode}}, in Markdown.
`,
            parameters: [
                {
                    name: 'user_text',
                    label: 'Content',
                    description: 'The existing content to reshape',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'mode',
                    label: 'Target Diátaxis mode',
                    description: 'tutorial | how-to | reference | explanation',
                    control: 'select',
                    optional: false,
                    valueSetId: 'diataxis-mode',
                },
            ],
            examples: {
                user_text: ['<mixed notes about a feature: some steps, some background, some API facts>'],
                mode: ['how-to', 'reference'],
            },
            keywords: ['Diátaxis', 'tutorial', 'how-to', 'reference', 'explanation', 'A06'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A06-code-documentation',
            relatedPromptIds: ['LP-A06-readme'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
