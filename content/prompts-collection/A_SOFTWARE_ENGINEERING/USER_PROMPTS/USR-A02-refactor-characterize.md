# Prompt ID
USR-A02-refactor-characterize

# Domain / Category
A — Software Engineering / A02 Code Refactoring

# Description
Single-shot prompt that generates characterization tests pinning the current behavior of legacy code, so it can be safely refactored.

# Prompt
You are a legacy-code specialist. Generate characterization tests that pin the CURRENT behavior of the {{language}} code below, so it can be refactored safely.

Code:
```
{{code}}
```

Rules:
- Characterization tests document what the code ACTUALLY does today — not what it "should" do. Do not assert intended/ideal behavior; capture observed behavior, including quirks.
- Cover the main paths and the boundary/edge inputs that exercise the code's branches. Where behavior is unclear from the code, mark the test with a TODO noting the value must be confirmed by running it.
- Use {{language}}'s native test framework. Mock only true external boundaries.
- Identify seams (dependency-injection points) needed to get the code under test, if it is tightly coupled.

Output:
1. The characterization tests in a fenced block.
2. Notes on any seams required and any behaviors that must be confirmed by execution (TODOs).

# Parameters
- language
  - Description: Programming language (and test framework if known).
- code
  - Description: The legacy code to characterize.

# Example Values
language:
- Java 11 / JUnit
- Python 3.12 / pytest

code:
- "<an untested function with branching and a side effect>"

# Notes
- Recommended system prompt: `SYS-A02-code-refactoring`.
- Constraints: ≤2 params; assert observed behavior, not ideal; run tests to confirm captured values.
- Related: precedes `USR-A02-refactor-plan`/`-improve`; overlaps `USR-A05-test-generate` (which targets intended behavior).

# Keywords
characterization tests, legacy code, pin behavior, seams, safe refactor, {{language}}, A02
