import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A07-api-design',
    categoryCode: 'A07',
    title: 'Design an API Contract',
    subtitle: 'Contract-first API in REST, GraphQL, or gRPC',
    description: 'Contract-first API in REST, GraphQL, or gRPC',
    variantAxes: [],
    defaultVariantId: 'USR-A07-arch-apiDesign',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A07-arch-apiDesign',
            kind: 'user',
            categoryCode: 'A07',
            title: 'Design an API Contract',
            description: 'Design an API Contract',
            template: `You are an API architect. Design a contract-first Application Programming Interface (API) for the requirements below, in the {{style}} style.

Requirements:
\`\`\`
{{requirements}}
\`\`\`

Design rules:
1. Model resources/operations clearly. For REST: nouns not verbs, correct HTTP methods/status codes, ≤2 nesting levels. For GraphQL: a clean schema avoiding over/under-fetching. For gRPC: clear service/messages in proto.
2. Define versioning (no breaking changes to a published version; additive changes preferred), pagination (prefer cursor at scale), filtering/sorting, idempotency for writes (idempotency key / request id), and a consistent error model.
3. Keep it consistent and predictable; do not leak the database schema as the API.

Output contract:
1. The contract sketch (endpoints/schema/proto) in a fenced block.
2. Conventions: versioning, pagination, errors, idempotency, auth approach.
3. A short example request/response and a bullet list of assumptions.
`,
            parameters: [
                {
                    name: 'requirements',
                    label: 'API requirements',
                    description: 'What the API must do — resources, operations, consumers, constraints',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'style',
                    label: 'API style',
                    description: 'REST | GraphQL | gRPC',
                    control: 'select',
                    optional: false,
                    valueSetId: 'api-style',
                },
            ],
            examples: {
                requirements: [
                    'CRUD for orders + list by customer; public third-party consumers; needs caching.',
                    'Internal low-latency service-to-service inventory lookups.',
                ],
                style: ['REST', 'gRPC'],
            },
            keywords: ['API design', 'REST', 'GraphQL', 'gRPC', 'contract-first', 'versioning', 'idempotency', 'A07'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A07-architecture',
            relatedPromptIds: ['LP-A06-api-reference', 'LP-A07-design'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
