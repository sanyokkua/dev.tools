# Prompt ID
USR-A02-refactor-plan

# Domain / Category
A — Software Engineering / A02 Code Refactoring

# Description
Single-shot prompt that produces a safe, ordered, step-by-step refactoring plan for a snippet given its known issues.

# Prompt
You are a refactoring specialist. Produce a safe, ordered refactoring plan for the {{language}} code below, addressing the issues noted.

Code:
```
{{code}}
```

Known issues / smells to address: {{smells}}

Rules:
- Plan small, behavior-preserving steps that keep the code working after each step. Sequence them so risk is minimized and tests can run between steps.
- For each step: the refactoring (named), what it changes, and how to verify behavior is unchanged.
- If no tests exist, the first step must be adding characterization tests to pin current behavior.
- Do not rewrite the code here; output the plan only.

Output: a numbered plan — Step · Refactoring · What changes · How to verify. End with risks and a recommended stopping point if time is limited.

# Parameters
- language
  - Description: Programming language of the snippet.
- code
  - Description: The code to be refactored.
- smells
  - Description: The issues/smells to address (e.g., from `USR-A02-refactor-smells`).

# Example Values
language:
- TypeScript
- Go

code:
- "<module with a god class and duplicated logic>"

smells:
- "Large Class, Duplicated Code, Long Parameter List"

# Notes
- Recommended system prompt: `SYS-A02-code-refactoring`.
- Constraints: 3 params; plan only; tests-first when none exist.
- Related: `USR-A02-refactor-characterize`, then `USR-A02-refactor-improve`/`USR-A02-refactor-pattern`.

# Keywords
refactoring plan, steps, safe refactor, characterization tests, sequence, {{language}}, A02
