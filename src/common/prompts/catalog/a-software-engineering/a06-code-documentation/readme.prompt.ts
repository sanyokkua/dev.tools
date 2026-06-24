import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A06-readme',
    categoryCode: 'A06',
    title: 'Draft a README',
    subtitle: 'A clear, quickstart-first README from a project description',
    description: 'A clear, quickstart-first README from a project description',
    variantAxes: [],
    defaultVariantId: 'USR-A06-doc-readme',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A06-doc-readme',
            kind: 'user',
            categoryCode: 'A06',
            title: 'Draft a README',
            description: 'Draft a README',
            template: `You are a documentation engineer. Draft a README in Markdown for the project described below.

Project information:
\`\`\`
{{projectInfo}}
\`\`\`

Include these sections (omit any with no available information rather than padding):
1. Title + one-line description.
2. What it is / why it exists.
3. Quickstart: install and run (minimal steps).
4. Usage: the most common examples.
5. Configuration (key options/environment variables), if any.
6. Project structure (brief), if useful.
7. Contributing & license, if applicable.

Rules:
1. Lead with a quickstart so a new user succeeds fast. Be concrete; use only details present in the input. Do not invent commands, package names, or license terms — mark unknowns as "TODO: confirm".
2. Conversational-but-professional tone; scannable headings.

Output contract: ONLY the README in Markdown.
`,
            parameters: [
                {
                    name: 'projectInfo',
                    label: 'Project information',
                    description:
                        'What the project does, stack, install/run steps, and any config/usage details available',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                projectInfo: [
                    'A command-line tool that converts CSV to JSON. Node 20. Install via npm i -g csv2json. Usage: csv2json input.csv.',
                    'A Python library for parsing invoices; pip install; exposes parse(path).',
                ],
            },
            keywords: ['README', 'quickstart', 'onboarding', 'usage', 'install', 'Markdown', 'A06'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A06-code-documentation',
            relatedPromptIds: ['AGT-A06-document-code'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
