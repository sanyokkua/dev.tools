# Prompt ID
USR-C03-plan-dependencies

# Domain / Category
C — Thinking & Productivity / C03 Planning

# Description
Single-shot prompt that identifies dependencies among subtasks and proposes an execution order, including what can run in parallel and the critical path.

# Prompt
For the subtasks below, identify dependencies and propose an execution order. Determine which subtasks must precede others, which can run in parallel, and which are on the critical path (the longest dependency chain that determines the timeline). Flag any circular or unclear dependencies.

Subtasks:
```
{{subtasks}}
```

Output:
1. A dependency list (X must precede Y, and why).
2. A suggested ordering / phases, marking parallelizable groups.
3. The critical path.
4. Risks: bottlenecks, single points of failure, or unclear dependencies to resolve.

# Parameters
- subtasks
  - Description: The list of subtasks (e.g., from `USR-C03-plan-breakdown`).

# Example Values
subtasks:
- "set up auth provider; build login UI; add session storage; write tests; deploy"

# Notes
- Recommended system prompt: `SYS-C03-planning`.
- Constraints: 1 param; explicit deps + parallelism + critical path.
- Related: `USR-C03-plan-breakdown` (produce subtasks first), `USR-C03-plan-estimate`.

# Keywords
dependencies, sequencing, critical path, parallel, ordering, planning, C03
