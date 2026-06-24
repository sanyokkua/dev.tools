import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A02-smells',
    categoryCode: 'A02',
    title: 'Identify Code Smells',
    subtitle: 'Diagnose smells without rewriting, mapping each to a refactoring',
    description: 'Diagnose smells without rewriting, mapping each to a refactoring',
    variantAxes: [],
    defaultVariantId: 'USR-A02-refactor-smells',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A02-refactor-smells',
            kind: 'user',
            categoryCode: 'A02',
            title: 'Identify Code Smells',
            description: 'Identify Code Smells',
            template: `You are a refactoring specialist. Analyze the {{language}} code below and identify its code smells. Do NOT rewrite the code — diagnose only.

Code:
\`\`\`
{{code}}
\`\`\`

Rules:
1. Name each smell using the standard catalog: Long Function, Large Class, Feature Envy, Data Clumps, Primitive Obsession, Shotgun Surgery, Divergent Change, Message Chains, Middle Man, Speculative Generality, Duplicated Code, Long Parameter List.
2. For each smell: cite where it occurs, explain why it is a problem, and name the refactoring that would address it (Extract Function, Move Function, Introduce Parameter Object, Replace Conditional with Polymorphism, etc.).
3. Distinguish genuine smells from acceptable trade-offs; do not flag style that a linter/formatter owns.
4. Prioritize: list the highest-impact smells first.

Output contract: a prioritized list — **Smell** · Location · Why it matters · Suggested refactoring. End with the single most valuable change to make first.
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
                    description: 'The code to analyze',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: { code: ['<a 120-line method with nested conditionals and duplicated blocks>'] },
            keywords: ['code smell', 'analysis', 'refactoring', 'Long Function', 'Feature Envy', 'A02'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A02-code-refactoring',
            relatedPromptIds: ['LP-A02-plan', 'LP-A02-improve'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
