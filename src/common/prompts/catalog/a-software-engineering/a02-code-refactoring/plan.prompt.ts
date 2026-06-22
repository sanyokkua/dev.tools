import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A02-plan',
    categoryCode: 'A02',
    title: 'Build a Refactoring Plan',
    subtitle: 'A safe, ordered, behavior-preserving step sequence',
    description: 'A safe, ordered, behavior-preserving step sequence',
    variantAxes: [],
    defaultVariantId: 'USR-A02-refactor-plan',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A02-refactor-plan',
            kind: 'user',
            categoryCode: 'A02',
            title: 'Build a Refactoring Plan',
            description: 'Build a Refactoring Plan',
            template: `You are a refactoring specialist. Produce a safe, ordered refactoring plan for the {{language}} code below, addressing the issues noted.

Code:
\`\`\`
{{code}}
\`\`\`

Known issues / smells to address (optional — if blank, identify them first): {{smells}}

Rules:
1. Plan small, behavior-preserving steps that keep the code working after each step. Sequence them so risk is minimized and tests can run between steps.
2. For each step: the refactoring (named), what it changes, and how to verify behavior is unchanged.
3. If no tests exist, the FIRST step must be adding characterization tests to pin current behavior.
4. Do not rewrite the code here; output the plan only.

Output contract: a numbered plan — Step · Refactoring · What changes · How to verify. End with risks and a recommended stopping point if time is limited.

Worked example —
Input language: "TypeScript"; code: module with a god class and duplicated logic; smells: "Large Class, Duplicated Code, Long Parameter List".
Expected plan (excerpt):
1. Add characterization tests for the public methods · pin current behavior · run, confirm green.
2. Extract Function for duplicated logic · removes one of the duplicates · tests stay green.
3. Move the extracted function + related fields into a new class (Extract Class) · shrinks the god class · tests green.
4. Introduce Parameter Object for the repeated arg group · shortens signatures · tests green.
Risks: hidden global state may break extraction — verify after step 2. Stop after step 2 if time is short (already a net win).
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
                    description: 'The code to be refactored',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'smells',
                    label: 'Known issues / smells to address',
                    description: 'The issues/smells to address (e.g., from the Identify Code Smells prompt)',
                    control: 'textarea',
                    optional: true,
                },
            ],
            examples: { smells: ['Large Class, Duplicated Code, Long Parameter List'] },
            keywords: ['refactoring plan', 'steps', 'safe refactor', 'characterization tests', 'A02'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A02-code-refactoring',
            relatedPromptIds: ['LP-A02-characterize', 'LP-A02-improve'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
