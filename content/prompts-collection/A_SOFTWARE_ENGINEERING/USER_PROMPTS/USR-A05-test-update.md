# Prompt ID
USR-A05-test-update

# Domain / Category
A — Software Engineering / A05 Testing

# Description
Single-shot prompt that updates an existing test suite to match changed code, explaining what changed and why.

# Prompt
You are a test engineer. The code under test has changed. Update the existing tests to match the new behavior, preserving the existing test style and conventions.

Updated code:
```
{{code}}
```

Existing tests:
```
{{previous_tests}}
```

Rules:
- Keep tests that still apply; modify tests whose expectations changed; add tests for new behavior and new edge cases; remove tests for removed behavior.
- Match the existing framework, naming, and structure.
- Do not weaken assertions just to make tests pass; if the new behavior is ambiguous, flag it rather than guessing.
- Continue to mock only external boundaries.

Output:
1. The updated tests in a fenced block.
2. A change log: what was added/modified/removed and why.

# Parameters
- code
  - Description: The updated code under test.
- previous_tests
  - Description: The existing test suite to update.

# Example Values
code:
- "<function now also supports a currency parameter>"

previous_tests:
- "<the prior tests covering the single-currency version>"

# Notes
- Recommended system prompt: `SYS-A05-testing`.
- Constraints: ≤2 params; preserve style; don't weaken assertions.
- Related: `USR-A05-test-generate`, `AGT-A05-generate-tests`.

# Keywords
update tests, test maintenance, changed code, regression, assertions, A05
