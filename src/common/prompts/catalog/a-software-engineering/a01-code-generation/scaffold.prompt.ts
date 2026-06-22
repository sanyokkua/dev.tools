import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A01-scaffold',
    categoryCode: 'A01',
    title: 'Scaffold a New Module or Project',
    subtitle: 'Produce an idiomatic project skeleton with starter files',
    description: 'Produce an idiomatic project skeleton with starter files',
    variantAxes: [],
    defaultVariantId: 'USR-A01-codegen-scaffold',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A01-codegen-scaffold',
            kind: 'user',
            categoryCode: 'A01',
            title: 'Scaffold a New Module or Project',
            description: 'Scaffold a New Module or Project',
            template: `You are an experienced {{language}} developer. Produce an initial module/project scaffold for the purpose below.

Purpose & requirements:
\`\`\`
{{spec}}
\`\`\`

Rules:
1. Propose a conventional, maintainable directory/file structure for {{language}} and the stated libraries/frameworks.
2. Provide the key files with minimal, working starter code: entry point, core module(s), config, and one placeholder test.
3. Keep it scalable and idiomatic; do not over-engineer. Do not invent libraries — name any third-party dependency and note it must be verified to exist.
4. State assumptions for anything unspecified.

Output contract:
1. A directory tree (as text).
2. The starter content for each key file in fenced blocks, each labeled with its path.
3. Setup/run notes and a bullet list of assumptions.

Worked example —
Input language: "Node.js 20 / TypeScript"; spec: "A REST API service for managing tasks, using Express and a Postgres client; include a health endpoint."
Expected output shape: a tree with \`src/index.ts\`, \`src/routes/tasks.ts\`, \`src/routes/health.ts\`, \`src/db/pool.ts\`, \`src/config.ts\`, \`test/health.test.ts\`, plus \`package.json\` and \`tsconfig.json\`; each file given as a labeled fenced block with minimal working code (Express app, a GET /health returning 200, a typed Postgres pool reading config from env). Notes: "run \`npm install\` then \`npm run dev\`; verify \`express\` and \`pg\` versions." Assumption: "connection string supplied via DATABASE_URL."
`,
            parameters: [
                {
                    name: 'language',
                    label: 'Programming language / runtime',
                    description: 'Target language/runtime (and version if relevant)',
                    control: 'select',
                    optional: false,
                    valueSetId: 'programming-language',
                },
                {
                    name: 'spec',
                    label: 'Purpose & requirements',
                    description:
                        'What the module/project is for, plus required libraries/frameworks and any constraints',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                spec: [
                    'A REST API service for managing tasks, using Express and a Postgres client; include a health endpoint.',
                    'A command-line tool that converts CSV to JSON, with subcommands and unit tests.',
                ],
            },
            keywords: ['scaffold', 'project', 'module', 'boilerplate', 'structure', 'A01'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A01-code-generation',
            relatedPromptIds: ['LP-A01-class', 'AGT-A01-implement'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
