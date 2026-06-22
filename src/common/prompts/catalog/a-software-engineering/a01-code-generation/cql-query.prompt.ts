import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A01-cql-query',
    categoryCode: 'A01',
    title: 'Generate a Cassandra Query Language (CQL) Query',
    subtitle: 'Write a partition-aware CQL query against a given Cassandra schema',
    description: 'Write a partition-aware CQL query against a given Cassandra schema',
    variantAxes: [],
    defaultVariantId: 'USR-A01-codegen-cqlQuery',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A01-codegen-cqlQuery',
            kind: 'user',
            categoryCode: 'A01',
            title: 'Generate a Cassandra Query Language (CQL) Query',
            description: 'Generate a Cassandra Query Language (CQL) Query',
            template: `You are a Cassandra Query Language (CQL) expert. Write a correct CQL query for the need below against the given keyspace/schema.

Need:
\`\`\`
{{description}}
\`\`\`

Schema (keyspace, tables, partition & clustering keys):
\`\`\`
{{schema}}
\`\`\`
Keyspace (optional): {{keyspace}}

Rules (Cassandra data model — read carefully):
1. Queries MUST filter by the full partition key (equality). Clustering keys define ordering/range WITHIN a partition and must be constrained left-to-right.
2. Do NOT produce queries that require \`ALLOW FILTERING\` unless explicitly requested. If the access pattern isn't supported by the current schema, say so and propose the modeling fix — a query-specific table (denormalized/duplicated for this read), a materialized view, or a secondary index (only for low-cardinality columns).
3. Use only tables/columns in the schema; do not invent objects.
4. Avoid anti-patterns: unbounded multi-partition scans, large \`IN\` on partition keys (fan-out), secondary indexes on high-cardinality columns, and unbounded partitions (wide rows).

Output contract:
1. The CQL in a fenced \`\`\`sql\`\`\` block — OR a note that the schema cannot support the access pattern, plus the recommended modeling fix (with the new table's \`PRIMARY KEY\` shown).
2. The partition/clustering keys it relies on and the row grain.
3. A bullet list of assumptions and modeling notes.

Worked example —
Input need: "Get the latest 20 events for a given device, newest first."; schema: "events(device_id, event_time, payload) PRIMARY KEY (device_id, event_time)) WITH CLUSTERING ORDER BY (event_time DESC)"
Expected query:
\`\`\`sql
SELECT event_time, payload
FROM events
WHERE device_id = ?
ORDER BY event_time DESC
LIMIT 20;
\`\`\`
Keys: partition key \`device_id\` (equality), clustering key \`event_time\` (ordering). Row grain: one row per event within the device partition. Note: clustering order is already DESC in the table, so no \`ALLOW FILTERING\` is needed.
`,
            parameters: [
                {
                    name: 'description',
                    label: 'Data access need',
                    description: 'The data access need in plain language',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'schema',
                    label: 'Keyspace / table schema',
                    description: 'Keyspace/table definitions including partition and clustering keys',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'keyspace',
                    label: 'Keyspace name',
                    description: 'Target keyspace name (and replication context if relevant)',
                    control: 'text',
                    optional: true,
                },
            ],
            examples: {
                description: [
                    'Get the latest 20 events for a given device, newest first.',
                    'Look up a user profile by user_id.',
                ],
                schema: [
                    'events(device_id, event_time, payload) PRIMARY KEY (device_id, event_time)) WITH CLUSTERING ORDER BY (event_time DESC)',
                    'users(user_id, name, email) PRIMARY KEY (user_id)',
                ],
            },
            keywords: ['Cassandra', 'CQL', 'query', 'partition key', 'clustering key', 'NoSQL', 'A01'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A01-code-generation',
            relatedPromptIds: ['LP-A01-sql-query'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
