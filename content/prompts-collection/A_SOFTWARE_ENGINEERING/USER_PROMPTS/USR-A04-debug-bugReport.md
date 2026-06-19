# Prompt ID
USR-A04-debug-bugReport

# Domain / Category
A — Software Engineering / A04 Debugging

# Description
Single-shot prompt that turns rough notes about a problem into a clear, structured, reproducible bug report.

# Prompt
You are a QA/engineering specialist. Turn the rough notes below into a clear, structured bug report a developer can act on.

Notes:
```
{{user_text}}
```

Produce a report with these sections (omit a section only if the notes truly contain nothing for it, and mark it "Unknown"):
- **Summary** — one line.
- **Environment** — OS / runtime / version / build or commit if given.
- **Steps to reproduce** — numbered, minimal.
- **Expected result** vs **Actual result** (include the exact error/stack if present).
- **Reproducibility** — always / intermittent (frequency).
- **Scope** — when it started / last known good, if known.
- **Workaround** — if any.
- **Artifacts** — logs/screenshots/repro to attach.

Rules: use only facts present in the notes; do not invent steps, versions, or errors. Mark missing-but-important fields as "Unknown — please provide." Redact any secrets.

Output: ONLY the structured bug report in Markdown.

# Parameters
- user_text
  - Description: Rough notes describing the problem.

# Example Values
user_text:
- "search breaks sometimes when you put weird characters, prod only, started after last deploy"
- "app crashes on login for some users, see error about token"

# Notes
- Recommended system prompt: `SYS-A04-debugging`.
- Constraints: 1 param; no invented facts; mark unknowns; redact secrets.
- Related: `USR-A04-debug-diagnose` (then diagnose the reported bug).

# Keywords
bug report, reproduce, steps, expected actual, environment, triage, QA, A04
