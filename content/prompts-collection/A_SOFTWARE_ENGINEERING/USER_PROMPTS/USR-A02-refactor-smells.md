# Prompt ID
USR-A02-refactor-smells

# Domain / Category
A — Software Engineering / A02 Code Refactoring

# Description
Single-shot prompt that identifies code smells in a snippet without rewriting it, mapping each to a recommended refactoring.

# Prompt
You are a refactoring specialist. Analyze the {{language}} code below and identify its code smells. Do NOT rewrite the code — diagnose only.

Code:
```
{{code}}
```

Rules:
- Name each smell using the standard catalog (e.g., Long Function, Large Class, Feature Envy, Data Clumps, Primitive Obsession, Shotgun Surgery, Divergent Change, Message Chains, Speculative Generality).
- For each smell: cite where it occurs, explain why it is a problem, and name the refactoring that would address it.
- Distinguish genuine smells from acceptable trade-offs; do not flag style that a linter owns.
- Prioritize: list the highest-impact smells first.

Output: a prioritized list — **Smell** · Location · Why it matters · Suggested refactoring. End with the single most valuable change to make first.

# Parameters
- language
  - Description: Programming language of the snippet.
- code
  - Description: The code to analyze.

# Example Values
language:
- Java 21
- Python 3.12

code:
- "<a 120-line method with nested conditionals and duplicated blocks>"

# Notes
- Recommended system prompt: `SYS-A02-code-refactoring`.
- Constraints: ≤2 params; analysis only (no rewrite).
- Related: chain → `USR-A02-refactor-plan` → `USR-A02-refactor-improve`/`USR-A02-refactor-pattern`.

# Keywords
code smell, analysis, refactoring, Long Function, Feature Envy, diagnose, {{language}}, A02
