import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A01-sql-query',
    categoryCode: 'A01',
    title: 'Generate a SQL Query',
    subtitle: 'Write a correct, dialect-specific SQL query against a given schema',
    description: 'Write a correct, dialect-specific SQL query against a given schema',
    variantAxes: [],
    defaultVariantId: 'USR-A01-codegen-sqlQuery',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A01-codegen-sqlQuery',
            kind: 'user',
            categoryCode: 'A01',
            title: 'Generate a SQL Query',
            description: 'Generate a SQL Query',
            template: `You are a Structured Query Language (SQL) expert. Write a correct, readable SQL query for the {{dialect}} dialect that satisfies the need below.

Need:
\`\`\`
{{description}}
\`\`\`

Schema (tables/columns available):
\`\`\`
{{schema}}
\`\`\`

Rules:
1. Use ONLY tables/columns present in the schema; do not invent objects. If the schema is insufficient, say what is missing and provide the closest correct query with stated assumptions.
2. Prefer explicit column lists over \`SELECT *\`; use parameter placeholders for user-supplied values (never string-concatenate input — this prevents SQL injection).
3. Use {{dialect}}-correct syntax and functions. Dialect rules to honor:
   - PostgreSQL: \`LIMIT n\`; placeholders \`$1\`; \`date_trunc('month', ts)\`; standard \`||\` concatenation; \`ILIKE\` for case-insensitive.
   - MySQL: \`LIMIT n\`; placeholders \`?\`; \`DATE_FORMAT(ts,'%Y-%m')\`; backtick identifiers; no \`FULL OUTER JOIN\` (emulate with UNION).
   - SQL Server (T-SQL): \`TOP n\` or \`OFFSET … FETCH\`; placeholders \`@p\`; \`FORMAT()\`/\`CONVERT\`; bracket identifiers \`[col]\`.
   - Oracle: \`FETCH FIRST n ROWS ONLY\` (12c+); placeholders \`:p\`; \`TRUNC(ts,'MM')\`; dual table for scalars.
   - BigQuery: \`LIMIT n\`; \`@param\`; backtick \`project.dataset.table\`; \`DATE_TRUNC(ts, MONTH)\`; standard SQL only.
   - Snowflake: \`LIMIT n\`; \`:param\` or \`?\`; \`DATE_TRUNC('month', ts)\`; case-insensitive unquoted identifiers.
4. Add brief comments for non-obvious logic. Note performance considerations (indexes, large scans) where relevant.

Output contract:
1. The query in a fenced \`\`\`sql\`\`\` block.
2. A one-line explanation of what it returns and the row grain.
3. A bullet list of assumptions and performance notes.
`,
            parameters: [
                {
                    name: 'dialect',
                    label: 'SQL dialect',
                    description:
                        'Target SQL dialect (PostgreSQL, MySQL, SQL Server, Oracle, SQLite, BigQuery, Snowflake)',
                    control: 'select',
                    optional: false,
                    valueSetId: 'sql-dialect',
                },
                {
                    name: 'description',
                    label: 'Data need',
                    description: 'The data need in plain language (what rows/aggregations are wanted)',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'schema',
                    label: 'Schema (tables/columns)',
                    description: 'Relevant tables and columns (Data Definition Language statements or a concise list)',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                description: [
                    'Top 10 customers by total order value in the last 90 days.',
                    'Monthly active users per plan tier for this year.',
                ],
                schema: [
                    'customers(id, name); orders(id, customer_id, total, created_at)',
                    'users(id, plan_id, last_active_at); plans(id, tier)',
                ],
            },
            keywords: ['SQL', 'query', 'database', 'schema', 'joins', 'aggregation', 'A01'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A01-code-generation',
            relatedPromptIds: ['LP-A01-cql-query', 'LP-A11-log-query'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
