# Prompt ID
USR-C03-plan-breakdown

# Domain / Category
C — Thinking & Productivity / C03 Planning

# Description
Single-shot prompt that decomposes a task/goal into a hierarchy of manageable, verifiable subtasks (a work breakdown).

# Prompt
Decompose the task/goal below into a clear work breakdown. Produce a hierarchy of subtasks where each leaf is small enough to estimate and verify, and the subtasks together cover the whole goal (no gaps, minimal overlap). Group related subtasks. For each leaf, note its rough size (S/M/L) and its "done" condition. Do not invent scope beyond the goal; mark anything ambiguous as an assumption.

Task / goal:
```
{{task}}
```

Output: a hierarchical breakdown (grouped subtasks → leaves with size + done-condition), plus assumptions and any scope questions.

# Parameters
- task
  - Description: The task or goal to break down (with any known scope/constraints).

# Example Values
task:
- "Add SSO login to the web app."
- "Migrate reporting from spreadsheets to a dashboard."

# Notes
- Recommended system prompt: `SYS-C03-planning`.
- Constraints: 1 param; leaves estimable/verifiable; cover the goal; no invented scope.
- Related: `USR-C03-plan-dependencies` (order them), `USR-C03-plan-estimate`.

# Keywords
task breakdown, WBS, subtasks, decompose, planning, C03
