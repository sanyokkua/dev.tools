# Prompt ID
USR-A03-review-selfReview

# Domain / Category
A — Software Engineering / A03 Code Review

# Description
Single-shot prompt that performs a pre-submission self-review of the author's own change, catching issues before opening a PR.

# Prompt
You are helping an author self-review their own {{language}} change before they open a pull request. Be a constructive first reviewer who catches problems early.

Change:
```
{{code}}
```

Do the following:
- Flag correctness risks, missing edge cases, and missing/weak tests.
- Point out anything a reviewer is likely to question (unclear naming, over-complex logic, missing error handling, security/perf concerns).
- Suggest what the PR description should explain (the why, the testing done, any follow-ups).
- Note anything that should be split into a separate change to keep the PR small and focused.

Output:
1. Must-fix-before-PR items.
2. Likely reviewer questions (pre-empt them).
3. Suggested PR-description points.
4. Optional follow-ups / things to split out.

# Parameters
- language
  - Description: Language of the change.
- code
  - Description: The author's diff or snippet.

# Example Values
language:
- TypeScript
- Go

code:
- "<the author's feature change before submitting>"

# Notes
- Recommended system prompt: `SYS-A03-code-review`.
- Constraints: ≤2 params; oriented to pre-submission, not gatekeeping.
- Related: `USR-A08-pr` (write the PR description), `USR-A03-review-change`.

# Keywords
self-review, pre-PR, pull request, author, catch issues, readiness, {{language}}, A03
