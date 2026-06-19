# Prompt ID
USR-C02-decide-compareSolutions

# Domain / Category
C — Thinking & Productivity / C02 Decision Support

# Description
Single-shot prompt that compares technical solutions/tools across the dimensions that matter for the user's context, with an honest recommendation.

# Prompt
Compare the technical options below for the stated context. Identify the dimensions that actually matter here (e.g., fit to requirements, maturity, performance, operability, cost, ecosystem/support, learning curve, lock-in) and compare each option across them. Be honest about trade-offs and uncertainty; do not present unproven options as safe.

Options:
```
{{options}}
```

Context (requirements, constraints, team, scale):
```
{{context}}
```

Output: a comparison table (options × dimensions) · the standout trade-offs · a recommendation tied to the context, with the conditions under which a different option would win · what to validate (spike/POC) before committing.

# Parameters
- options
  - Description: The technical solutions/tools to compare.
- context
  - Description: Requirements, constraints, team, and scale that shape the decision.

# Example Values
options:
- "PostgreSQL vs MongoDB for the new service's primary store."
- "Next.js vs Remix vs plain React."

context:
- "small team, mostly relational data, strong consistency needed, moderate scale"

# Notes
- Recommended system prompt: `SYS-C02-decision-support`.
- Constraints: ≤2 params; context-driven dimensions; honest trade-offs.
- Related: `USR-A07-arch-tradeoff`, `USR-C02-decide-weightedMatrix`.

# Keywords
compare solutions, tools, technology choice, trade-offs, recommendation, C02
