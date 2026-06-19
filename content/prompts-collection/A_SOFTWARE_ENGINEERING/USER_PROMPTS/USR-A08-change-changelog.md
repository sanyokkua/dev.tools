# Prompt ID
USR-A08-change-changelog

# Domain / Category
A — Software Engineering / A08 Change Communication

# Description
Single-shot prompt that produces Keep a Changelog–style entries from a list of changes.

# Prompt
You are an engineering communication editor. Turn the changes below into changelog entries following the Keep a Changelog convention.

Changes:
```
{{changes}}
```

Rules:
- Group entries under the standard headings, using only those that apply: **Added, Changed, Deprecated, Removed, Fixed, Security**.
- Write for humans: each entry is a concise, user-meaningful sentence (the noticeable difference), not a raw commit subject. Merge related commits into one entry.
- Put new work under an `## [Unreleased]` section (newest first). Do not invent version numbers or dates.
- Use only facts from the input; omit internal-only noise.

Output: ONLY the changelog section in Markdown.

# Parameters
- changes
  - Description: The list of changes (commits, PR titles, or notes) to compile.

# Example Values
changes:
- "added webhook support; fixed timezone bug in email notifications; patched XSS in comments"
- "removed deprecated /v1/legacy endpoint; improved search performance"

# Notes
- Recommended system prompt: `SYS-A08-change-communication`.
- Constraints: 1 param; Keep a Changelog headings; human-readable; no invented versions/dates.
- Related: `USR-A08-change-releaseNotes` (user-facing prose), `USR-A08-change-commit`.

# Keywords
changelog, keep a changelog, added changed fixed, unreleased, release, A08
