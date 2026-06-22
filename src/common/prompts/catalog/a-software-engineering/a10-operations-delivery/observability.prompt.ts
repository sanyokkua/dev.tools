import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A10-observability',
    categoryCode: 'A10',
    title: 'Plan Observability',
    subtitle: 'Logs, metrics, traces, SLIs/SLOs, alerts, and dashboards for a stack',
    description: 'Logs, metrics, traces, SLIs/SLOs, alerts, and dashboards for a stack',
    variantAxes: [],
    defaultVariantId: 'USR-A10-ops-observability',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A10-ops-observability',
            kind: 'user',
            categoryCode: 'A10',
            title: 'Plan Observability',
            description: 'Plan Observability',
            template: `You are an observability engineer. Design an observability plan for the stack below.

Stack & context:
\`\`\`
{{stack}}
\`\`\`

Cover the three signals and more:
1. **Metrics** — the key RED (Rate, Errors, Duration) / USE (Utilization, Saturation, Errors) metrics for the service type; what to instrument.
2. **Logs** — structured logging guidance; what to log (the why + relevant state) and what NOT to log (secrets/Personally Identifiable Information (PII), noise).
3. **Traces** — where distributed tracing adds value; span boundaries.
4. **Service Level Indicators/Objectives (SLIs/SLOs)** — propose meaningful SLIs and SLO targets; mark proposed numbers to confirm.
5. **Alerts** — alert on symptoms / SLO burn, not every metric; thresholds and what each alert means; avoid alert fatigue.
6. **Dashboards** — what the primary dashboard should show.

Rules: least-privilege for collection; call out cost drivers (log volume, high-cardinality metrics). State assumptions.

Output contract: the plan organized by the sections above, with proposed SLOs/thresholds flagged.

Worked example —
Input: "A Java service on ECS behind an ALB, using RDS and SQS; Datadog available."
Expected (excerpt): Metrics — request rate, error rate, p50/p95/p99 latency (RED); RDS connections + CPU, SQS queue depth/age (USE). Logs — structured JSON with request/correlation IDs; never log auth tokens. Traces — trace across ALB → service → RDS/SQS spans. SLIs/SLOs — availability ≥ 99.9% [proposed], p95 latency ≤ 300ms [proposed]. Alerts — page on SLO error-budget burn and SQS age > threshold, not on raw CPU. Cost note: high-cardinality tags (e.g., per-user) inflate Datadog custom-metric cost.
`,
            parameters: [
                {
                    name: 'stack',
                    label: 'Stack & context',
                    description: 'The application/infrastructure stack and what needs observing',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                stack: [
                    'A Java service on ECS behind an ALB, using RDS and SQS; Datadog available.',
                    'A set of Lambda functions with API Gateway and DynamoDB; CloudWatch only.',
                ],
            },
            keywords: ['observability', 'logs metrics traces', 'SLO', 'alerting', 'dashboards', 'RED USE', 'A10'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A10-operations-delivery',
            relatedPromptIds: ['LP-A11-log-query', 'LP-A10-postmortem'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
