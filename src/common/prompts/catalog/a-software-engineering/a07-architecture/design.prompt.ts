import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A07-design',
    categoryCode: 'A07',
    title: 'Propose an Architecture',
    subtitle: 'A design with explicit trade-offs and at least two options',
    description: 'A design with explicit trade-offs and at least two options',
    variantAxes: [],
    defaultVariantId: 'USR-A07-arch-design',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A07-arch-design',
            kind: 'user',
            categoryCode: 'A07',
            title: 'Propose an Architecture',
            description: 'Propose an Architecture',
            template: `You are a software architect. Propose an architecture for the requirements below. Treat every choice as a trade-off and make the trade-offs explicit.

Requirements & constraints:
\`\`\`
{{requirements}}
\`\`\`

Do the following:
1. Restate the key functional requirements and the priority quality attributes (scale, latency, availability, security, cost, etc.). If critical constraints are missing, state your assumptions.
2. Consider at least two candidate approaches; recommend one and explain why, including the downsides of your choice.
3. Describe components, responsibilities, data flow, and boundaries. Match complexity to the problem (prefer the simplest design that meets the goals).
4. Note non-functional considerations and open questions/risks.

Output contract: a concise design — Requirements summary · Options considered (≥2) · Recommended architecture (components, data flow) · Trade-offs & risks · Open questions.

Worked example —
Input: "Ingest 10k events/sec, store 90 days, serve dashboards with <1s p95; small team."
Expected (excerpt): Options — (A) managed stream (Kinesis/Kafka) → time-series store → cached query API; (B) direct writes to a relational DB with materialized views. Recommend A for the ingest rate; downside: more moving parts and ops burden for a small team — mitigate with managed services. Components: ingest gateway → stream → consumer → time-series store → dashboard API with a cache. Risks: high-cardinality metrics blow up cost; 90-day retention sizing. Open question: query patterns (aggregations vs raw)?
`,
            parameters: [
                {
                    name: 'requirements',
                    label: 'Requirements & constraints',
                    description: 'Functional and non-functional requirements and constraints for the system',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                requirements: [
                    'Ingest 10k events/sec, store 90 days, serve dashboards with <1s p95; small team.',
                    'A multi-tenant SaaS billing service; strong consistency for invoices.',
                ],
            },
            keywords: ['architecture', 'system design', 'trade-offs', 'components', 'data flow', 'A07'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A07-architecture',
            relatedPromptIds: ['LP-A07-tradeoff', 'LP-A07-adr'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
