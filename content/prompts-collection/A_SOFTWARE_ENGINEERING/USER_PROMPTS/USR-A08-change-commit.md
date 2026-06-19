# Prompt ID
USR-A08-change-commit

# Domain / Category
A — Software Engineering / A08 Change Communication

# Description
Single-shot prompt that writes a Conventional Commit message from a change summary or diff.

# Prompt
You are an engineering communication editor. Write a Conventional Commit message for the change below.

Change summary or diff:
```
{{changeSummary}}
```

Rules:
- Format: `<type>[optional scope]: <description>` — imperative mood, subject ≤ ~50 chars, no trailing period. Types: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. Use `!` or a `BREAKING CHANGE:` footer for breaking changes.
- Subject = what changed (imperative). Body (wrap ~72) = what and WHY, not how. Add a footer for issue refs only if present in the input.
- Use only facts from the input; do not invent ticket numbers or rationale that isn't supported.

Output: ONLY the commit message (subject + blank line + body + optional footer), in a plain code block.

# Parameters
- changeSummary
  - Description: A summary of the change or the diff itself.

# Example Values
changeSummary:
- "fixed the redirect loop when a token expires by guarding re-entry in session middleware"
- "added webhook support for publish events"

# Notes
- Recommended system prompt: `SYS-A08-change-communication`.
- Constraints: 1 param; Conventional Commits; what+why not how; no invented refs.
- Related: `USR-A08-change-pr`, `AGT-A08-commit-and-pr` (from staged diff).

# Keywords
commit message, conventional commits, what why, imperative, semver, A08
