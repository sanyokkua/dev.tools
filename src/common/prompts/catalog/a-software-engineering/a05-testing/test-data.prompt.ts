import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A05-test-data',
    categoryCode: 'A05',
    title: 'Generate Test Data',
    subtitle: 'Realistic, diverse synthetic data in a requested format',
    description: 'Realistic, diverse synthetic data in a requested format',
    variantAxes: [],
    defaultVariantId: 'USR-A05-test-data',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A05-test-data',
            kind: 'user',
            categoryCode: 'A05',
            title: 'Generate Test Data',
            description: 'Generate Test Data',
            template: `You are a test engineer. Generate realistic, diverse test data that matches the model below.

Data model (fields and types):
\`\`\`
{{model}}
\`\`\`

Output format: {{format}}
Number of records: {{count}}

Rules:
1. Respect every field's type and any stated constraints; produce valid records by default.
2. Make the data diverse and realistic (varied names, plausible values, edge values where useful); avoid obvious dummy repetition.
3. Include a few boundary/edge records (e.g., min/max, empty optional fields) clearly, if useful for testing.
4. Do not include real personal data; synthesize values. Keep output strictly in {{format}}.

Output contract: ONLY the dataset in {{format}} (a fenced block), with no commentary.

Worked example —
Input model: "User { id: uuid, name: string, age: int(0-120), email: string, active: bool }"; format: JSON; count: 3.
Expected output (a fenced JSON array): three objects with valid UUIDs, varied realistic names, ages spanning the range (including a boundary like 0 or 120), synthetic emails matching the names, and a mix of \`active\` true/false — no commentary outside the block.
`,
            parameters: [
                {
                    name: 'model',
                    label: 'Data model (fields and types)',
                    description: 'The object/record structure — fields, types, and constraints',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'format',
                    label: 'Output format',
                    description: 'Output format (JSON, CSV, SQL INSERTs, YAML)',
                    control: 'select',
                    optional: false,
                    valueSetId: 'data-format',
                },
                {
                    name: 'count',
                    label: 'Number of records',
                    description: 'Number of records to generate',
                    control: 'text',
                    optional: false,
                },
            ],
            examples: {
                model: ['User { id: uuid, name: string, age: int(0-120), email: string, active: bool }'],
                format: ['JSON', 'CSV'],
                count: ['10', '50'],
            },
            keywords: ['test data', 'fixtures', 'synthetic data', 'JSON', 'CSV', 'A05'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A05-testing',
            relatedPromptIds: ['LP-A05-generate-tests'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
