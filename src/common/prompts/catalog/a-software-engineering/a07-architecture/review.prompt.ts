import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A07-review',
    categoryCode: 'A07',
    title: 'Review a Design',
    subtitle: 'Critique a proposed architecture for risks, trade-offs, and gaps',
    description: 'Critique a proposed architecture for risks, trade-offs, and gaps',
    variantAxes: [],
    defaultVariantId: 'USR-A07-arch-review',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A07-arch-review',
            kind: 'user',
            categoryCode: 'A07',
            title: 'Review a Design',
            description: 'Review a Design',
            template: `You are a software architect performing a design review. Critique the proposed design below — constructively and concretely.

Design:
\`\`\`
{{design}}
\`\`\`

Evaluate:
1. Fit to requirements/quality attributes (does it actually meet the stated goals?).
2. Hidden or understated trade-offs and risks (scaling, consistency, failure modes, operability, cost, security).
3. Complexity versus the problem (over- or under-engineered?).
4. Missing concerns (observability, data migration, backward compatibility, rollback).
5. Alternatives worth considering.

Rules: critique the design, not the author; ground each point in a reason; distinguish blocking risks from minor suggestions. If key context is missing to judge, say what you'd need.

Output contract: **Strengths** · **Risks & trade-offs (ranked)** · **Gaps/missing concerns** · **Alternatives to consider** · **Overall: ready / ready-with-changes / needs-rework**.

Worked example —
Input: "an RFC proposing microservices + event sourcing for a brand-new product, small team."
Expected (excerpt): Strengths — clear scaling story. Risks (ranked) — (1) operational complexity vs a small team [blocking]; (2) event-sourcing learning curve and eventual-consistency bugs; (3) premature decomposition before domain boundaries are known. Gaps — no migration/rollback story, observability unaddressed. Alternative — modular monolith first, extract services when boundaries stabilize. Overall: needs-rework.
`,
            parameters: [
                {
                    name: 'design',
                    label: 'Design to review',
                    description: 'The proposed architecture/design to review (doc, diagram description, or RFC)',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                design: [
                    '<an RFC proposing microservices + event sourcing for a new product>',
                    '<a diagram + notes for a serverless ingestion pipeline>',
                ],
            },
            keywords: ['design review', 'architecture', 'risks', 'trade-offs', 'critique', 'gaps', 'A07'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A07-architecture',
            relatedPromptIds: ['LP-A07-tradeoff', 'LP-A03-review-change'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
