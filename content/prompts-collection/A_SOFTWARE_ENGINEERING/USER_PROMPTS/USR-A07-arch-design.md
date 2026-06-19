# Prompt ID
USR-A07-arch-design

# Domain / Category
A — Software Engineering / A07 Architecture

# Description
Single-shot prompt that proposes a software architecture/design for stated requirements, with explicit trade-offs and at least two options considered.

# Prompt
You are a software architect. Propose an architecture for the requirements below. Treat every choice as a trade-off and make the trade-offs explicit.

Requirements & constraints:
```
{{requirements}}
```

Do the following:
- Restate the key functional requirements and the priority quality attributes (scale, latency, availability, security, cost, etc.). If critical constraints are missing, state your assumptions.
- Consider at least two candidate approaches; recommend one and explain why, including the downsides of your choice.
- Describe components, responsibilities, data flow, and boundaries. Match complexity to the problem (prefer the simplest design that meets the goals).
- Note non-functional considerations and open questions/risks.

Output: a concise design — Requirements summary · Options considered · Recommended architecture (components, data flow) · Trade-offs & risks · Open questions.

# Parameters
- requirements
  - Description: Functional and non-functional requirements and constraints for the system.

# Example Values
requirements:
- "Ingest 10k events/sec, store 90 days, serve dashboards with <1s p95; small team."
- "A multi-tenant SaaS billing service; strong consistency for invoices."

# Notes
- Recommended system prompt: `SYS-A07-architecture`.
- Constraints: 1 param; ≥2 options; explicit trade-offs.
- Related: `USR-A07-arch-tradeoff`, `USR-A07-arch-adr`, `AGT-A07-adr-from-context`.

# Keywords
architecture, system design, trade-offs, components, data flow, options, A07
