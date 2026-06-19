# Prompt ID
USR-C01-idea-generate

# Domain / Category
C — Thinking & Productivity / C01 Ideation

# Description
Single-shot, parameterized prompt that generates a target number of varied ideas for a problem, with evaluation deferred.

# Prompt
Generate {{count}} varied ideas for the problem below. This is divergent ideation — do NOT evaluate, rank, or critique any idea yet. Aim for breadth: span different categories (cheap vs expensive, incremental vs radical, build vs buy vs partner, conventional vs unconventional). Push past the obvious first few. Keep each idea to one concrete sentence.

Problem:
```
{{problem}}
```

Output: a numbered list of {{count}} distinct ideas, no evaluation. (To evaluate afterward, use a C02 decision-support prompt.)

# Parameters
- problem
  - Description: The problem or opportunity to ideate on.
- count
  - Description: How many ideas to generate (e.g., 10, 20).

# Example Values
problem:
- "Reduce p95 API latency without adding infrastructure cost."
- "Increase trial-to-paid conversion."

count:
- 15
- 20

# Notes
- Recommended system prompt: `SYS-C01-ideation`.
- Constraints: ≤2 params; divergent only (no evaluation); breadth required.
- Related: `USR-C01-idea-hmw` (frame first), `USR-C02-decide-weightedMatrix` (evaluate after).

# Keywords
brainstorm, ideas, divergent, generate, options, ideation, C01
