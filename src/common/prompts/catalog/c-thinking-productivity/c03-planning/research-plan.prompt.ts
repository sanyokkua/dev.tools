import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-C03-research-plan',
    categoryCode: 'C03',
    title: 'Plan a Research Project',
    subtitle: 'Decompose a research question into MECE sub-questions, sources, and a stopping criterion',
    description: 'Decompose a research question into MECE sub-questions, sources, and a stopping criterion',
    variantAxes: ['mode'],
    defaultVariantId: 'USR-C03-research-plan',
    modeClass: 'dual',
    variants: [
        {
            id: 'USR-C03-research-plan',
            kind: 'user',
            categoryCode: 'C03',
            title: 'Plan a Research Project',
            description: 'Plan a Research Project',
            template: `Create a structured research plan for the topic below. Do NOT answer the questions — produce the plan only.

Steps:
1. Restate the topic in one sentence to confirm scope.
2. Decompose it into sub-questions that are Mutually Exclusive, Collectively Exhaustive (MECE) where possible — no overlap, no gaps — and group them into coherent themes.
3. Note clarifying questions wherever the scope is ambiguous.
4. For each theme, suggest the kinds of sources and methods to use, and how to tell a credible source from a weak one (favor lateral reading — check what other independent sources say about a source — over surface cues).
5. Prioritize the sub-questions, and define a stopping criterion: when is the research "done enough" (e.g. when new sources stop adding new themes — saturation)?

Topic: \`\`\`{{topic}}\`\`\`
Domain context (optional): \`\`\`{{context}}\`\`\`
Audience level (optional): \`\`\`{{audience}}\`\`\`

Output: the research plan — restated topic · clarifying questions · themed MECE sub-questions · sources/methods per theme · prioritized sub-question list · stopping criterion. Do not answer the questions.
`,
            parameters: [
                {
                    name: 'topic',
                    label: 'Research topic / question',
                    description: 'The research topic or question.',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'context',
                    label: 'Domain context (optional)',
                    description: 'e.g. "engineering decision, B2B SaaS".',
                    control: 'text',
                    optional: true,
                },
                {
                    name: 'audience',
                    label: 'Audience level (optional)',
                    description: 'Who the research is for (novice / practitioner / expert).',
                    control: 'select',
                    optional: true,
                    valueSetId: 'audience-level',
                },
            ],
            examples: {
                topic: [
                    'How should we evaluate vector databases for our retrieval-augmented-generation use case?',
                    'What are current best practices for prompt caching?',
                ],
                context: ['engineering decision, mid-size product team', ''],
                audience: ['practitioner', ''],
            },
            keywords: ['research plan', 'sub-questions', 'MECE', 'themes', 'scope', 'stopping criterion', 'C03'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C03-planning',
            relatedPromptIds: ['LP-C04-research-questions', 'LP-C04-synthesize'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'AGT-C03-research-plan',
            kind: 'agent',
            categoryCode: 'C03',
            title: 'Agent: Plan a Research Project',
            description: 'Plan a Research Project',
            template: `You are planning a research project, working in an agent environment with file access. Create a structured research plan for the topic below, grounded in what already exists in the source folder. Do NOT answer the research questions — produce the plan.

Steps:
1. Traverse \`{{folder_path}}\`. List the relevant files you actually find (real paths only — never invent a filename or a path). Note each file's apparent type and what it appears to cover. If the folder is empty or unreadable, say so and proceed with a plan that assumes no existing material.
2. Restate the topic in one sentence to confirm scope.
3. Decompose the topic into Mutually Exclusive, Collectively Exhaustive (MECE) sub-questions grouped into themes.
4. For each sub-question, mark coverage against the folder: **already covered** (cite the real file path), **partially covered** (cite the file + the gap), or **not covered** (a true gap to research). Base "covered" only on content you actually read — do not assume a file's contents from its name.
5. For the gaps, suggest the kinds of sources/methods to use and how to judge a source's credibility (lateral reading over surface cues).
6. Prioritize the sub-questions and define a stopping criterion (saturation — when new sources stop adding new themes).

Topic: \`\`\`{{topic}}\`\`\`
Audience level (optional): \`\`\`{{audience}}\`\`\`

Output: the research plan — files found (real paths) · restated topic · themed MECE sub-questions with per-question coverage (cited paths) · suggested sources/methods for the gaps · prioritized list · stopping criterion. Do not answer the questions; cite only files that exist.
`,
            parameters: [
                {
                    name: 'folder_path',
                    label: 'Source folder',
                    description: 'Path to the folder of existing material to plan research around.',
                    control: 'text',
                    optional: false,
                },
                {
                    name: 'topic',
                    label: 'Research topic / question',
                    description: 'The research topic or question.',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'audience',
                    label: 'Audience level (optional)',
                    description: 'Who the research is for (novice / practitioner / expert).',
                    control: 'select',
                    optional: true,
                    valueSetId: 'audience-level',
                },
            ],
            examples: {
                folder_path: ['./research/vector-db-eval', 'docs/notes'],
                topic: ['How should we evaluate vector databases for our retrieval-augmented-generation use case?'],
                audience: ['practitioner', ''],
            },
            keywords: ['research plan', 'MECE', 'folder', 'coverage', 'gaps', 'stopping criterion', 'agent', 'C03'],
            executionContext: 'agent',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C03-planning',
            relatedPromptIds: ['LP-C04-research-questions', 'LP-C04-synthesize'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
