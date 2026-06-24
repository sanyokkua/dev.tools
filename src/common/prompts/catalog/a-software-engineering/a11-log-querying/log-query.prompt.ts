import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A11-log-query',
    categoryCode: 'A11',
    title: 'Generate a CloudWatch Logs Insights Query',
    subtitle: 'Turn a plain-language need into a valid, cost-aware CloudWatch query',
    description: 'Turn a plain-language need into a valid, cost-aware CloudWatch query',
    variantAxes: [],
    defaultVariantId: 'USR-A11-logQuery',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A11-logQuery',
            kind: 'user',
            categoryCode: 'A11',
            title: 'Generate a CloudWatch Logs Insights Query',
            description: 'Generate a CloudWatch Logs Insights Query',
            template: `You are an Amazon CloudWatch Logs Insights / Log Analytics query assistant. Convert the request below into a valid, optimized, copy-paste-ready query. Use ONLY documented syntax — never invent commands, functions, or field names.

Request:
\`\`\`
{{requirement}}
\`\`\`

Platform / log source (if known): {{platform}}

=== REFERENCE: USE ONLY WHAT IS LISTED HERE ===

Default language: Logs Insights Query Language (QL). Use OpenSearch PPL or SQL only if the user asks for JOINs, SQL familiarity, or pipe-style analytics.

QL clause order: \`[SOURCE …] | fields/parse | filter | stats … by … | sort | limit\`. Comments begin with \`#\`.

QL commands (allowed): \`fields\` (project/derive, supports \`as\` aliases), \`display\`, \`filter\` (comparison, regex \`like /…/\`, \`in\`, \`ispresent\`), \`filterIndex\` (index-only scan; NOT on IA class), \`parse\` (glob \`"* [*] *"\`, regex named groups \`(?<name>…)\`), \`sort\` (asc/desc), \`stats\` (aggregations, up to 10 stats commands), \`limit\` (default 1,000 in console, 10,000 max display; \`limit any N\` fetches first N), \`dedup\`, \`pattern\` (Standard only), \`diff\` (period comparison; Standard only), \`unmask\` (Standard only), \`unnest\`, \`lookup\`, \`join\`, \`anomaly\`, subqueries, \`SOURCE\` (CLI/API only).

QL function families (allowed): datetime — \`bin(5m|1h|1d)\`, \`dateceil\`, \`datefloor\` (time units s/m/h/d/w; \`s\` caps at 60); general — \`ispresent()\`, \`coalesce()\`, \`isValidIp()\`; JSON — \`jsonParse()\`, dot/bracket access; IP — \`isIpv4InSubnet()\`, \`cidr()\`, new: \`isPublicIP()\`, \`isPrivateIP()\`, \`ipv4ToNumber()\`; string — \`strlen\`, \`substr\`, \`toupper\`, \`tolower\`, \`replace\`, \`trim\`, new: \`strcontains\`, \`split\`; aggregation — \`count(*)\`, \`count_distinct()\`, \`sum\`, \`avg\`, \`min\`, \`max\`, \`pct(field, n)\`, \`earliest\`, \`latest\`, \`stddev\`; conversion (new) — \`toNumber\`, \`toInt\`, \`toLong\`, \`toDouble\`; conditional (new) — \`if(...)\`. (Caveat: \`strcontains\` case-insensitive mode was observed unreliable at launch — do not rely on it.)

\`@\`-prefixed system field catalog (always available; user/JSON fields do NOT start with \`@\`):
\`@timestamp\` (event time), \`@ingestionTime\` (receipt time), \`@message\` (raw log line), \`@logStream\`, \`@log\` (log group), \`@requestId\`, \`@duration\`, \`@billedDuration\`, \`@type\` (e.g., "REPORT" for Lambda), \`@maxMemoryUsed\`, \`@memorySize\`, and for cross-account: \`@aws.account\`, \`@aws.region\`.

Known AWS log-source standard fields: Lambda REPORT lines (\`@duration\`, \`@billedDuration\`, \`@maxMemoryUsed\`); VPC Flow Logs (\`srcAddr\`, \`dstAddr\`, \`bytes\`, \`action\`); API Gateway (\`status\`, \`integrationLatency\`); ALB; CloudTrail (\`eventName\`, \`userIdentity.*\`); ECS/EKS (\`kubernetes.namespace_name\`).

Cost rules: $0.005 per GB scanned, regardless of rows returned. ALWAYS minimize scan — tight time range (set in the console UI, or with \`START=/END=\` in SOURCE), minimal log groups, an early \`filter\`, and a \`limit\`. Prefer \`=\`/\`in\` over \`like\` (only \`=\`/\`in\` are index-eligible).

Restriction matrix:
- Infrequent Access (IA) class: QL works EXCEPT \`pattern\`, \`diff\`, \`filterIndex\`, \`unmask\`. PPL/SQL not supported on IA at all.
- PPL/SQL: Standard class only; cannot paginate beyond 10,000 rows; \`SOURCE\` not available; SQL allows only one JOIN per SELECT and no multi-statement queries.
- QL exclusives: \`SOURCE\`, \`diff\`/comparison, parameterized saved queries, 100,000-row pagination.

=== END REFERENCE ===

Rules:
1. Default to QL. Follow the clause order and prefer index-eligible filters.
2. If the log source is a known AWS type, use its standard fields; otherwise, if the schema is unknown, FIRST give a schema-probe query (\`fields @timestamp, @message | limit 20\`), then the real query built from likely fields.
3. Never invent business field names/values; state assumptions. Ask one question only if no field AND no value AND no recognizable source is present.

Output contract — exactly these parts:
1. **Explanation** (2–3 sentences).
2. **Primary Query** (one fenced block).
3. **Output Shape** (the columns/rows produced).
4. **Customization Hints**.
5. **Assumptions**.
6. **Alternatives** (2–4).
7. **Notes** (only if a constraint/cost risk applies).
`,
            parameters: [
                {
                    name: 'requirement',
                    label: 'Log analysis need',
                    description: 'The log analysis need in plain language',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'platform',
                    label: 'Log source / language (optional)',
                    description:
                        'The log source/type and/or which query language, if known (default = CloudWatch Logs Insights QL)',
                    control: 'text',
                    optional: true,
                },
            ],
            examples: {
                requirement: [
                    'Count errors per minute for the last hour.',
                    'p50/p95/p99 Lambda duration per hour.',
                    'Top 10 source/destination IP pairs by bytes in VPC Flow Logs.',
                ],
                platform: ['CloudWatch, Lambda logs', 'VPC Flow Logs'],
            },
            keywords: [
                'CloudWatch',
                'Logs Insights',
                'query',
                'QL',
                'log analysis',
                'cost',
                'schema probe',
                'AWS',
                'A11',
            ],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A11-log-querying',
            relatedPromptIds: ['LP-A01-sql-query', 'LP-A10-observability'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
