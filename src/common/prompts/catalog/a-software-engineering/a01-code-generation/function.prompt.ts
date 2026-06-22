import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A01-function',
    categoryCode: 'A01',
    title: 'Generate a Function',
    subtitle: 'Produce one well-structured function from a plain-language requirement',
    description: 'Produce one well-structured function from a plain-language requirement',
    variantAxes: [],
    defaultVariantId: 'USR-A01-codegen-function',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A01-codegen-function',
            kind: 'user',
            categoryCode: 'A01',
            title: 'Generate a Function',
            description: 'Generate a Function',
            template: `You are an experienced {{language}} developer. Generate a single, well-structured {{language}} function that fulfills the requirement below.

Requirement:
\`\`\`
{{requirements}}
\`\`\`

Rules:
1. Use idiomatic {{language}}, intent-revealing names, and a single responsibility (one reason to change).
2. Validate inputs and handle errors per {{language}} conventions (raise/throw/return-error as idiomatic).
3. Do NOT invent libraries or Application Programming Interfaces (APIs); prefer the standard library. If you reference a third-party package, name it and note that it must be verified to exist.
4. If a detail is missing, choose the safest reasonable interpretation and state the assumption — do not stop to ask.
5. Do not add functionality beyond the requirement (You Aren't Gonna Need It — YAGNI).

Output contract — return exactly these three parts:
1. The function in a fenced \`\`\`{{language}}\`\`\` block.
2. One line stating its contract: inputs, return value, and error behavior.
3. A bullet list of any assumptions made.

Worked example —
Input language: "Python 3.12"; requirement: "Parse an ISO-8601 date string and return the number of whole days until today; raise on invalid input."
Expected output shape:
\`\`\`python
from datetime import date, datetime

def days_until(iso_date: str) -> int:
    """Return whole days from today until the given ISO-8601 date (negative if past)."""
    try:
        target = datetime.fromisoformat(iso_date).date()
    except ValueError as exc:
        raise ValueError(f"invalid ISO-8601 date: {iso_date!r}") from exc
    return (target - date.today()).days
\`\`\`
Contract: input an ISO-8601 string; returns int days (negative if in the past); raises ValueError on malformed input.
Assumptions: dates compared at day granularity in the system local date; time component ignored.
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
                    name: 'requirements',
                    label: 'Requirement',
                    description: 'What the function must do, including inputs/outputs if known',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                requirements: [
                    'Parse an ISO-8601 date string and return the number of whole days until today; raise on invalid input.',
                    'Given a list of order line items, return the total price as a Money value.',
                ],
            },
            keywords: ['function', 'method', 'code generation', 'clean code', 'A01'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A01-code-generation',
            relatedPromptIds: ['LP-A01-class', 'LP-A01-from-spec'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
