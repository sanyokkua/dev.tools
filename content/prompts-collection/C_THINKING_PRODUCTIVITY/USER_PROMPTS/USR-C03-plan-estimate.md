# Prompt ID
USR-C03-plan-estimate

# Domain / Category
C — Thinking & Productivity / C03 Planning

# Description
Single-shot prompt that produces three-point (PERT) effort estimates for tasks, with ranges and assumptions, countering the planning fallacy.

# Prompt
Produce effort estimates for the tasks below using three-point (PERT) estimation. For each task give Optimistic (O), Most Likely (M), and Pessimistic (P) estimates, then compute the expected estimate TE = (O + 4M + P) / 6 and a rough range. Sum for a total with a range. Treat estimates as ranges, NOT commitments. Counter the planning fallacy: explicitly consider how similar work has actually gone (the outside view) and what could make tasks run long. State the assumptions and the biggest sources of uncertainty.

Tasks:
```
{{tasks}}
```

Output: a table (task · O · M · P · TE) · the total with a range · key assumptions · top risks that could blow the estimate. Note the unit (hours/days/points) and that these are estimates, not promises.

# Parameters
- tasks
  - Description: The tasks to estimate (and any known size/context).

# Example Values
tasks:
- "implement login UI; integrate auth provider; write tests; deploy"
- "data migration from legacy DB"

# Notes
- Recommended system prompt: `SYS-C03-planning`.
- Constraints: 1 param; PERT formula; ranges not commitments; outside view.
- Related: `USR-C03-plan-breakdown` (estimate the leaves), `USR-C02-decide-prioritize` (effort input).

# Keywords
estimate, PERT, three-point, effort, ranges, planning fallacy, C03
