import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-C04-source-eval',
    categoryCode: 'C04',
    title: 'Evaluate a Source',
    subtitle: 'Judge credibility with lateral reading — type, authority, bias, and what to corroborate',
    description: 'Judge credibility with lateral reading — type, authority, bias, and what to corroborate',
    variantAxes: [],
    defaultVariantId: 'USR-C04-source-eval',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-C04-source-eval',
            kind: 'user',
            categoryCode: 'C04',
            title: 'Evaluate a Source',
            description: 'Evaluate a Source',
            template: `Evaluate the credibility of the source below. Use a lateral-reading mindset (the Stop, Investigate, Find, Trace — SIFT — approach): rather than trusting surface cues (it looks professional, it has citations), reason about what an informed fact-checker would do — leave the page and check what OTHER independent sources say about who is behind it, their expertise and incentives, and whether the key claims are corroborated elsewhere. Checklists that judge a page only from itself (the "vertical reading" the CRAAP test encourages) perform poorly against online misinformation; lateral reading does better.

Assess and report under these headings:
- **Type:** primary / secondary / tertiary, and what kind specifically (e.g. vendor page, peer-reviewed article, news report, personal blog, encyclopedia).
- **Authority:** who created it and their relevant expertise or standing.
- **Purpose / bias:** why it exists — commercial, advocacy, academic, or other incentives that could skew it.
- **Corroboration:** the specific things to check elsewhere to confirm its key claims (the lateral checks — name them concretely).
- **Currency:** how recent it is and whether it may be outdated (especially in a fast-moving field).
- **Verdict:** how much weight to give it, and for what kinds of claims.

Do NOT assert facts you cannot verify from the source; recommend the checks instead.

Source (description, URL info, or content):
\`\`\`
{{source}}
\`\`\`

Output: the assessment under those six headings, ending with a credibility **Verdict** and a short list of the specific lateral checks to run.
`,
            parameters: [
                {
                    name: 'source',
                    label: 'Source',
                    description: 'The source to evaluate — content, description, URL info, or reference details.',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                source: [
                    "A vendor white paper claiming their database is 'the #1 fastest' with an internal benchmark and no methodology.",
                    "A 2019 blog post titled 'Best practices for [fast-moving framework]', author unattributed.",
                ],
            },
            keywords: [
                'source evaluation',
                'credibility',
                'lateral reading',
                'SIFT',
                'bias',
                'primary secondary',
                'C04',
            ],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-C04-research-synthesis',
            relatedPromptIds: ['LP-C04-synthesize', 'LP-C04-matrix'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
