# Prompt ID
USR-A07-arch-qualityScenarios

# Domain / Category
A — Software Engineering / A07 Architecture

# Description
Single-shot prompt that converts vague non-functional requirements into measurable six-part quality-attribute scenarios.

# Prompt
You are a software architect. Convert the vague non-functional requirements below into concrete, measurable quality-attribute scenarios.

Requirements / quality goals:
```
{{requirements}}
```

For each quality attribute (performance, availability, scalability, security, modifiability, etc.), write a six-part scenario:
- **Source** of stimulus · **Stimulus** · **Artifact** (what part of the system) · **Environment** (normal/peak/failure) · **Response** · **Response measure** (a number/threshold).

Rules: every scenario must have a measurable response measure (latency, %, throughput, recovery time). If a number is not given, propose a reasonable target and mark it as a proposed value to confirm. Separate true constraints from assumptions.

Output: a table or list of scenarios (one per priority quality attribute), with proposed measures clearly marked, and a short note on which are highest priority.

# Parameters
- requirements
  - Description: The vague "-ilities" / quality goals to make measurable.

# Example Values
requirements:
- "It should be fast and highly available."
- "Must scale with growth and be secure."

# Notes
- Recommended system prompt: `SYS-A07-architecture`.
- Constraints: 1 param; every scenario has a measure; proposed numbers flagged.
- Related: `USR-A07-arch-design`, `USR-A07-arch-tradeoff`.

# Keywords
quality attributes, non-functional requirements, scenarios, measurable, performance, availability, A07
