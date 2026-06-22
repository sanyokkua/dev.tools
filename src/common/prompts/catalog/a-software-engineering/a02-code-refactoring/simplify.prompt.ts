import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A02-simplify',
    categoryCode: 'A02',
    title: 'Reduce Complexity',
    subtitle: 'Flatten nesting, remove duplication, simplify control flow — behavior preserved',
    description: 'Flatten nesting, remove duplication, simplify control flow — behavior preserved',
    variantAxes: [],
    defaultVariantId: 'USR-A02-refactor-simplify',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A02-refactor-simplify',
            kind: 'user',
            categoryCode: 'A02',
            title: 'Reduce Complexity',
            description: 'Reduce Complexity',
            template: `You are a refactoring specialist. Simplify the {{language}} code below to reduce complexity, without changing observable behavior.

Code:
\`\`\`
{{code}}
\`\`\`

Rules:
1. Reduce nesting (guard clauses, early returns), remove duplication, and flatten convoluted control flow. Prefer declarative constructs where idiomatic.
2. Keep the public interface and behavior stable. Do not remove functionality.
3. Do not over-abstract; simpler, not cleverer.

Output contract:
1. The simplified code in a fenced \`\`\`{{language}}\`\`\` block.
2. A short list of simplifications made.
3. A "behavior preserved" note and anything you could not simplify safely without tests.

Worked example —
Input language: "JavaScript"; code: a deeply nested if/else returning a discount tier.
Expected output: rewritten with early \`return\` guard clauses (invalid → throw early; then a flat tier ladder); simplifications: "inverted conditions to guard clauses; removed an else by returning early; deduplicated the tier lookup into a table"; behavior-preserved: "same tier returned for all sampled inputs; same error on invalid input."
`,
            parameters: [
                {
                    name: 'language',
                    label: 'Programming language',
                    description: 'Programming language of the snippet',
                    control: 'select',
                    optional: false,
                    valueSetId: 'programming-language',
                },
                {
                    name: 'code',
                    label: 'Code',
                    description: 'The code to simplify',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: { code: ['<deeply nested if/else with repeated branches>'] },
            keywords: ['simplify', 'reduce complexity', 'nesting', 'guard clause', 'deduplicate', 'A02'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A02-code-refactoring',
            relatedPromptIds: ['LP-A02-improve', 'LP-A02-smells'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
