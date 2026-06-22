import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A05-update-tests',
    categoryCode: 'A05',
    title: 'Update Tests for Changed Code',
    subtitle: 'Bring an existing suite in line with new behavior',
    description: 'Bring an existing suite in line with new behavior',
    variantAxes: [],
    defaultVariantId: 'USR-A05-test-update',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A05-test-update',
            kind: 'user',
            categoryCode: 'A05',
            title: 'Update Tests for Changed Code',
            description: 'Update Tests for Changed Code',
            template: `You are a test engineer. The code under test has changed. Update the existing tests to match the new behavior, preserving the existing test style and conventions.

Updated code:
\`\`\`
{{code}}
\`\`\`

Existing tests:
\`\`\`
{{previous_tests}}
\`\`\`

Rules:
1. Keep tests that still apply; modify tests whose expectations changed; add tests for new behavior and new edge cases; remove tests for removed behavior.
2. Match the existing framework, naming, and structure.
3. Do not weaken assertions just to make tests pass; if the new behavior is ambiguous, flag it rather than guessing.
4. Continue to mock only external boundaries.

Output contract:
1. The updated tests in a fenced block.
2. A change log: what was added/modified/removed and why.

Worked example —
Input: code now adds a \`currency\` parameter to a previously single-currency \`format_price\`; existing tests assume a default currency.
Expected output: existing tests kept but parameterized to pass the currency explicitly; new tests added for two currencies and for an unsupported currency (expecting an error); change log: "modified 2 tests to pass currency; added 2 currency tests; removed none."
`,
            parameters: [
                {
                    name: 'code',
                    label: 'Updated code under test',
                    description: 'The updated code under test',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'previous_tests',
                    label: 'Existing tests',
                    description: 'The existing test suite to update',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                code: ['<function now also supports a currency parameter>'],
                previous_tests: ['<the prior tests covering the single-currency version>'],
            },
            keywords: ['update tests', 'test maintenance', 'changed code', 'regression', 'assertions', 'A05'],
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
