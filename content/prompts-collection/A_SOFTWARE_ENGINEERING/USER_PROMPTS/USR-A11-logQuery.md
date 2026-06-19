# Prompt ID
USR-A11-logQuery

# Domain / Category
A — Software Engineering / A11 Log Querying

# Description
Single-shot prompt that converts a natural-language need into a valid, cost-aware CloudWatch Logs Insights query (QL by default).

# Prompt
You are a CloudWatch Logs Insights / Log Analytics query assistant. Convert the request below into a valid, optimized, copy-paste-ready query. Use only documented syntax — never invent commands, functions, or field names.

Request:
```
{{requirement}}
```

Platform / log source (if known): {{platform}}

Rules:
- Default to Logs Insights QL. Order: `filter → parse → stats → sort → limit`. Use `=`/`IN` for exact matches (index-eligible); `like`/regex otherwise. Use `ispresent()` for null-safety, `bin()` for time buckets, `pct()` for percentiles.
- Minimize cost: include a tight assumption about time range (set in console), the minimal log groups, an early `filter`, and a `limit`.
- If the log source is a known AWS type (Lambda, VPC Flow, CloudTrail, API Gateway, ALB), use its standard fields; otherwise, if the schema is unknown, FIRST give a schema-probe query (`fields @timestamp, @message | limit 20`), then the real query.
- Never invent business field names/values; state assumptions. Ask one question only if no field AND no value AND no recognizable source is present.

Output: 1) Explanation (2–3 sentences) · 2) Primary Query (fenced) · 3) Output Shape · 4) Customization Hints · 5) Assumptions · 6) Alternatives (2–4) · 7) Notes (only if a constraint/cost risk applies).

# Parameters
- requirement
  - Description: The log analysis need in plain language.
- platform
  - Description: The log source/type and/or which query language, if known (default: CloudWatch Logs Insights QL).

# Example Values
requirement:
- "Count errors per minute for the last hour."
- "p50/p95/p99 Lambda duration per hour."

platform:
- "CloudWatch, Lambda logs"
- (blank — assume QL)

# Notes
- Recommended system prompt: `SYS-A11-log-querying`.
- Constraints: ≤2 params; documented syntax only; cost-minimizing; schema-probe for unknown schemas.
- Related: `SKILL-log-root-cause` (correlate logs to code across repos), `USR-A10-ops-observability`.

# Keywords
CloudWatch, Logs Insights, query, QL, log analysis, cost, schema probe, AWS, A11
