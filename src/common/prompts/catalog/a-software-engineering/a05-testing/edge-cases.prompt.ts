import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A05-edge-cases',
    categoryCode: 'A05',
    title: 'Enumerate Edge Cases',
    subtitle: 'List boundary conditions and failure scenarios (no test code)',
    description: 'List boundary conditions and failure scenarios (no test code)',
    variantAxes: [],
    defaultVariantId: 'USR-A05-test-edgeCases',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A05-test-edgeCases',
            kind: 'user',
            categoryCode: 'A05',
            title: 'Enumerate Edge Cases',
            description: 'Enumerate Edge Cases',
            template: `You are a test engineer. Enumerate the edge cases, boundary conditions, and failure scenarios that should be tested for the feature/code below. Do NOT write test code — produce the scenario list.

Feature or code:
\`\`\`
{{featureOrCode}}
\`\`\`

Cover, where applicable:
1. Boundary values (empty, zero, one, max, off-by-one, overflow).
2. Invalid/malformed input and type/encoding issues.
3. Null/absent/optional fields.
4. Concurrency / ordering / idempotency / retries.
5. External failures (timeouts, errors, partial responses).
6. Security-relevant inputs (injection, oversized, Unicode).
7. State/permission preconditions.

Output contract: a grouped, prioritized checklist of scenarios, each phrased as a testable case ("when X, then expect Y"). Mark the highest-risk ones.
`,
            parameters: [
                {
                    name: 'featureOrCode',
                    label: 'Feature or code',
                    description: 'The feature description or code unit to analyze for edge cases',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                featureOrCode: [
                    'A file-upload endpoint accepting images up to 10MB',
                    '<a function parsing a date range string>',
                ],
            },
            keywords: ['edge cases', 'boundary', 'failure scenarios', 'test design', 'negative tests', 'A05'],
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
