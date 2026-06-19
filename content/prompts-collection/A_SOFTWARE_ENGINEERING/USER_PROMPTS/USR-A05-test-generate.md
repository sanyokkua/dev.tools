# Prompt ID
USR-A05-test-generate

# Domain / Category
A — Software Engineering / A05 Testing

# Description
Single-shot prompt that generates unit tests for given code, prioritizing edge cases and using the native test framework.

# Prompt
You are a test engineer. Generate unit tests for the code below using {{framework}}.

Code under test:
```
{{code}}
```

Rules:
- Cover at least one happy path plus several negative/edge/boundary cases. Test behavior through the public interface, not internal state.
- Mock only true external boundaries (network, DB, clock, filesystem); do NOT mock the logic under test.
- Use parameterized/table-driven tests for combinatorial inputs. Give each test a clear scenario name.
- Do not assert behavior the code does not exhibit; if intended behavior is ambiguous, add a test marked TODO with the question.

Output:
1. The tests in a fenced block, runnable with {{framework}}.
2. A short list of the scenarios covered and any gaps you could not cover.

# Parameters
- framework
  - Description: Language + test framework (e.g., "Python pytest", "JS Vitest", "Go testing").
- code
  - Description: The code to test.

# Example Values
framework:
- pytest
- Vitest
- JUnit 5

code:
- "<a discount calculator function>"
- "<a parser with error cases>"

# Notes
- Recommended system prompt: `SYS-A05-testing`.
- Constraints: ≤2 params; mock boundaries only; happy + ≥3 edge cases.
- Related: `USR-A05-test-edgeCases` (enumerate first), `USR-A05-test-data`, `AGT-A05-generate-tests` (in-repo + run).

# Keywords
unit tests, generate, edge cases, mocking, framework, coverage, {{framework}}, A05
