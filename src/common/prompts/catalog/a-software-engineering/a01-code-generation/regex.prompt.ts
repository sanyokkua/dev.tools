import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A01-regex',
    categoryCode: 'A01',
    title: 'Build a Regular Expression',
    subtitle: 'Construct and explain a regex for a matching task in a chosen flavor',
    description: 'Construct and explain a regex for a matching task in a chosen flavor',
    variantAxes: [],
    defaultVariantId: 'USR-A01-codegen-regex',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A01-codegen-regex',
            kind: 'user',
            categoryCode: 'A01',
            title: 'Build a Regular Expression',
            description: 'Build a Regular Expression',
            template: `You are a regular-expression (regex) expert. Build a regular expression for the matching task below, in the {{flavor}} flavor.

Matching task:
\`\`\`
{{description}}
\`\`\`

Rules:
1. Produce the simplest correct pattern; avoid catastrophic backtracking (Regular-expression Denial of Service — ReDoS): no nested quantifiers over overlapping alternations like \`(a+)+\`.
2. Explain the pattern piece by piece so it can be maintained.
3. Give matching and non-matching examples that demonstrate the boundaries.
4. Note flavor-specific caveats (escaping, Unicode, multiline/dotall flags; note Go RE2 has no backreferences/lookaround) and the limits of regex for this task (e.g., regex cannot fully validate email or parse nested structures).
5. If the task is ambiguous, state the interpretation you used.

Output contract:
1. The regex in an inline code span, and if useful a code snippet using it in {{flavor}}.
2. A part-by-part explanation.
3. Examples: should-match and should-not-match.
4. A bullet list of caveats/assumptions.

Worked example —
Input flavor: "JavaScript"; description: "Extract semantic version numbers like 1.2.3 or 10.0.0-beta from text."
Expected output shape: pattern \`\` \`/\\b(\\d+)\\.(\\d+)\\.(\\d+)(?:-([0-9A-Za-z.-]+))?\\b/g\` \`\` with groups explained (major/minor/patch, optional pre-release), should-match \`["1.2.3","10.0.0-beta"]\`, should-not-match \`["1.2","v1.2.3.4"]\`, caveat "does not validate build-metadata \`+\` segment; SemVer's full grammar is stricter."
`,
            parameters: [
                {
                    name: 'flavor',
                    label: 'Regex flavor / engine',
                    description: 'Regex flavor/engine (PCRE, JavaScript, Python re, Go RE2, Java, .NET)',
                    control: 'select',
                    optional: false,
                    valueSetId: 'regex-flavor',
                },
                {
                    name: 'description',
                    label: 'Matching task',
                    description: 'What the regex must match (and not match), with examples if available',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                description: [
                    'Match a valid email-like local@domain string for basic validation.',
                    'Extract semantic version numbers like 1.2.3 or 10.0.0-beta from text.',
                ],
            },
            keywords: ['regex', 'regular expression', 'pattern', 'match', 'validation', 'ReDoS', 'A01'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A01-code-generation',
            relatedPromptIds: ['LP-A01-function'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
