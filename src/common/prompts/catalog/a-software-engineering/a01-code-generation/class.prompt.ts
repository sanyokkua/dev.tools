import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A01-class',
    categoryCode: 'A01',
    title: 'Generate a Class or Type',
    subtitle: 'Produce a class/type from a specification of purpose, attributes, and methods',
    description: 'Produce a class/type from a specification of purpose, attributes, and methods',
    variantAxes: [],
    defaultVariantId: 'USR-A01-codegen-class',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A01-codegen-class',
            kind: 'user',
            categoryCode: 'A01',
            title: 'Generate a Class or Type',
            description: 'Generate a Class or Type',
            template: `You are an experienced {{language}} developer. Generate a {{language}} class (or equivalent type) that satisfies the specification below.

Specification:
\`\`\`
{{spec}}
\`\`\`

Rules:
1. Apply clear separation of concerns and a single, well-defined responsibility; favor encapsulation and immutability where idiomatic.
2. Name attributes and methods to reveal intent; document public members per {{language}} conventions.
3. Validate inputs in constructors/setters; handle errors idiomatically.
4. Do NOT invent libraries or Application Programming Interfaces (APIs). If a detail is missing, choose the safest interpretation and state the assumption.
5. Keep the public interface minimal — expose only what callers need.

Output contract:
1. The class in a fenced \`\`\`{{language}}\`\`\` block.
2. A short note on its responsibility and public interface.
3. A bullet list of assumptions made.
`,
            parameters: [
                {
                    name: 'language',
                    label: 'Programming language',
                    description: 'Target programming language (and version if relevant)',
                    control: 'select',
                    optional: false,
                    valueSetId: 'programming-language',
                },
                {
                    name: 'spec',
                    label: 'Specification',
                    description:
                        'Purpose, key attributes, methods, and any interactions or patterns the class must follow',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                spec: [
                    'A ShoppingCart that holds line items, can add/remove items, and computes a total; interacts with a PricingService.',
                    'An immutable Money value type with currency, supporting add/subtract and equality.',
                ],
            },
            keywords: ['class', 'type', 'object', 'code generation', 'encapsulation', 'A01'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A01-code-generation',
            relatedPromptIds: ['LP-A01-function', 'LP-A01-scaffold'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
