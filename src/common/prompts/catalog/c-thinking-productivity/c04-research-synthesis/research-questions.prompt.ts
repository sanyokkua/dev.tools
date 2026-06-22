import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-C04-research-questions',
    categoryCode: 'C04',
    title: 'Generate Research Questions',
    subtitle: 'Break a topic into themed, MECE sub-questions ordered foundational to advanced',
    description: 'Break a topic into themed, MECE sub-questions ordered foundational to advanced',
    variantAxes: [],
    defaultVariantId: 'USR-C04-research-questions',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-C04-research-questions',
            kind: 'user',
            categoryCode: 'C04',
            title: 'Generate Research Questions',
            description: 'Generate Research Questions',
            template: `Generate a structured set of research questions for the topic below. Do NOT answer them — produce the questions only.

Rules:
1. Decompose the topic into specific, answerable sub-questions.
2. Group them into coherent themes. Aim for Mutually Exclusive, Collectively Exhaustive (MECE): minimal overlap between themes, broad coverage of the topic.
3. Within each theme, order questions from foundational to advanced.
4. Flag which questions require primary data (you would have to gather it yourself) versus which can be answered from existing literature.
5. Name the one or two questions most critical to resolve first.

Topic:
\`\`\`
{{topic}}
\`\`\`

Output: themed groups of sub-questions (foundational → advanced), a note on which need primary data, and the top priority question(s). Do not answer them.
`,
            parameters: [
                {
                    name: 'topic',
                    label: 'Research topic',
                    description: 'The topic to break into questions.',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                topic: [
                    'Adopting event-driven architecture for our platform.',
                    'Improving onboarding completion rates for a mobile app.',
                ],
            },
            keywords: ['research questions', 'sub-questions', 'themes', 'MECE', 'decompose', 'C04'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C04-research-synthesis',
            relatedPromptIds: ['LP-C03-research-plan', 'LP-C04-synthesize'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
