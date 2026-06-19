# Prompt ID
USR-A02-refactor-simplify

# Domain / Category
A — Software Engineering / A02 Code Refactoring

# Description
Single-shot prompt that reduces complexity in a snippet — nesting, duplication, convoluted control flow — while preserving behavior.

# Prompt
You are a refactoring specialist. Simplify the {{language}} code below to reduce complexity, without changing observable behavior.

Code:
```
{{code}}
```

Rules:
- Reduce nesting (guard clauses, early returns), remove duplication, and flatten convoluted control flow. Prefer declarative constructs where idiomatic.
- Keep the public interface and behavior stable. Do not remove functionality.
- Do not over-abstract; simpler, not cleverer.

Output:
1. The simplified code in a fenced block.
2. A short list of simplifications made.
3. A "behavior preserved" note and anything you could not simplify safely without tests.

# Parameters
- language
  - Description: Programming language of the snippet.
- code
  - Description: The code to simplify.

# Example Values
language:
- Python 3.12
- JavaScript

code:
- "<deeply nested if/else with repeated branches>"

# Notes
- Recommended system prompt: `SYS-A02-code-refactoring`.
- Constraints: ≤2 params; behavior preserved; no functionality removed.
- Related: `USR-A02-refactor-improve`, `USR-A02-refactor-smells`.

# Keywords
simplify, reduce complexity, nesting, guard clause, deduplicate, refactor, {{language}}, A02
