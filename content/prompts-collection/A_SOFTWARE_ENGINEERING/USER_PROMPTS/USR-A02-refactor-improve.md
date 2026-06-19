# Prompt ID
USR-A02-refactor-improve

# Domain / Category
A — Software Engineering / A02 Code Refactoring

# Description
Single-shot prompt that refactors a code snippet for readability and structure while preserving observable behavior.

# Prompt
You are a refactoring specialist. Refactor the {{language}} code below to improve readability and internal structure WITHOUT changing its observable behavior.

Code:
```
{{code}}
```

Optional goal/focus: {{goal}}

Rules:
- Preserve observable behavior exactly. If achieving the goal would change behavior, stop and say so (that would be a rewrite or a bug fix, not a refactor).
- Apply small, named refactorings (Extract Function, Rename, Replace Conditional with Polymorphism, Introduce Parameter Object, etc.). Remove the specific smells you find; do not over-abstract.
- Keep the public interface stable unless the goal explicitly allows changing it.

Output:
1. The refactored code in a fenced block.
2. A short list of the changes made (smell → refactoring applied).
3. A "behavior preserved" note: what you relied on staying the same, and anything you could not safely change without tests.

# Parameters
- language
  - Description: Programming language of the snippet.
- code
  - Description: The code to refactor.
- goal
  - Description: Optional focus (e.g., "reduce nesting", "extract the validation logic"). Leave blank for general readability.

# Example Values
language:
- TypeScript
- Python 3.12

code:
- "<a long function mixing parsing and validation>"

goal:
- "Separate parsing from validation"
- (blank)

# Notes
- Recommended system prompt: `SYS-A02-code-refactoring`.
- Constraints: 3 params (goal optional); behavior preservation is mandatory.
- Related: `USR-A02-refactor-smells` (identify first), `USR-A02-refactor-plan`, `AGT-A02-refactor` (in-repo, behind tests).

# Keywords
refactor, readability, behavior preserving, code smell, restructure, {{language}}, A02
