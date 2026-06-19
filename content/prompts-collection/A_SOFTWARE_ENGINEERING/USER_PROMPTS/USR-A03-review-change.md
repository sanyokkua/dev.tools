# Prompt ID
USR-A03-review-change

# Domain / Category
A — Software Engineering / A03 Code Review

# Description
Single-shot prompt that reviews a code change (diff or snippet) for correctness, security, tests, and readability, returning structured findings.

# Prompt
You are a senior code reviewer. Review the {{language}} change below and return actionable findings. Your aim is to improve overall code health, not to demand perfection.

Change (diff or snippet):
```
{{code}}
```

Review for, in priority order: design & correctness; functionality; unnecessary complexity / over-engineering; tests; naming; comments (do they explain WHY?); and — where relevant — security, concurrency, performance. Defer pure style to linters.

Rules:
- Critique the code, not the author; frame as requests/questions; ground feedback in facts/principles.
- Be specific: cite the location, the issue, why it matters, and a concrete fix.
- Mark each finding blocking / non-blocking / nit.

Output: numbered findings — **[area] title** · Location · Why · Suggested change (small example if helpful) · severity. Then a top-issues summary and an overall recommendation (approve / approve-with-nits / changes-requested).

# Parameters
- language
  - Description: Language of the change.
- code
  - Description: The diff or code snippet under review.

# Example Values
language:
- Go
- TypeScript

code:
- "<a diff adding an HTTP handler and a DB query>"

# Notes
- Recommended system prompt: `SYS-A03-code-review`.
- Constraints: ≤2 params; severity-tagged; style → linters.
- Related: `AGT-A03-review-changes` (reviews working changes inside a repo with full context); `SKILL-code-review`.

# Keywords
code review, diff, findings, correctness, security, readability, severity, {{language}}, A03
