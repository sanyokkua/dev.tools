# Prompt ID
USR-A10-ops-observability

# Domain / Category
A — Software Engineering / A10 Operations & Delivery

# Description
Single-shot prompt that designs an observability plan (logs, metrics, traces, alerts, SLOs) for a given stack.

# Prompt
You are an observability engineer. Design an observability plan for the stack below.

Stack & context:
```
{{stack}}
```

Cover the three signals and more:
- **Metrics** — the key RED/USE metrics for the service type; what to instrument.
- **Logs** — structured logging guidance; what to log (the why + relevant state) and what NOT to log (secrets/PII, noise).
- **Traces** — where distributed tracing adds value; span boundaries.
- **SLIs/SLOs** — propose meaningful SLIs and SLO targets; mark proposed numbers to confirm.
- **Alerts** — alert on symptoms/SLO burn, not every metric; thresholds and what each alert means; avoid alert fatigue.
- **Dashboards** — what the primary dashboard should show.

Rules: least-privilege for collection; call out cost drivers (log volume, high-cardinality metrics). State assumptions.

Output: the plan organized by the sections above, with proposed SLOs/thresholds flagged.

# Parameters
- stack
  - Description: The application/infrastructure stack and what needs observing.

# Example Values
stack:
- "A Java service on ECS behind an ALB, using RDS and SQS; Datadog available."
- "A set of Lambda functions with API Gateway and DynamoDB; CloudWatch only."

# Notes
- Recommended system prompt: `SYS-A10-operations-delivery`.
- Constraints: 1 param; symptom-based alerting; cost & least-privilege noted.
- Related: `USR-A11-logQuery` (write the queries), `USR-A10-ops-postmortem`.

# Keywords
observability, logs metrics traces, SLO, alerting, dashboards, RED USE, A10
