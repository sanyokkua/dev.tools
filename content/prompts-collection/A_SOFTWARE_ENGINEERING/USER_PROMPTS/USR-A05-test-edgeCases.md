# Prompt ID
USR-A05-test-edgeCases

# Domain / Category
A — Software Engineering / A05 Testing

# Description
Single-shot prompt that enumerates edge cases, boundary conditions, and failure scenarios to test for a feature or code unit (no test code, just the scenarios).

# Prompt
You are a test engineer. Enumerate the edge cases, boundary conditions, and failure scenarios that should be tested for the feature/code below. Do not write test code — produce the scenario list.

Feature or code:
```
{{featureOrCode}}
```

Cover, where applicable:
- Boundary values (empty, zero, one, max, off-by-one, overflow).
- Invalid/malformed input and type/encoding issues.
- Null/absent/optional fields.
- Concurrency / ordering / idempotency / retries.
- External failures (timeouts, errors, partial responses).
- Security-relevant inputs (injection, oversized, unicode).
- State/permission preconditions.

Output: a grouped, prioritized checklist of scenarios, each phrased as a testable case ("when X, then expect Y"). Mark the highest-risk ones.

# Parameters
- featureOrCode
  - Description: The feature description or code unit to analyze for edge cases.

# Example Values
featureOrCode:
- "A file-upload endpoint accepting images up to 10MB"
- "<a function parsing a date range string>"

# Notes
- Recommended system prompt: `SYS-A05-testing`.
- Constraints: 1 param; scenarios only (no code).
- Related: `USR-A05-test-generate` (turn these into tests), `USR-C01-idea-scenarios`.

# Keywords
edge cases, boundary, failure scenarios, test design, negative tests, checklist, A05
