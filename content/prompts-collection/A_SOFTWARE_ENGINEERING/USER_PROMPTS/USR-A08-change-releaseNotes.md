# Prompt ID
USR-A08-change-releaseNotes

# Domain / Category
A — Software Engineering / A08 Change Communication

# Description
Single-shot prompt that writes user-facing release notes from a list of changes, in plain language for the intended audience.

# Prompt
You are an engineering communication editor. Write user-facing release notes for the changes below, addressed to {{audience}}.

Changes:
```
{{changes}}
```

Rules:
- Write in plain, benefit-oriented language for {{audience}} — describe what users can now do or what improved, not internal implementation. Lead with the most impactful items.
- Group sensibly (e.g., New, Improved, Fixed). Translate jargon; one change may merge several commits.
- Be honest and specific; do not overstate. Use only facts from the input; mark unknowns as "TODO".

Output: ONLY the release notes in Markdown, with a short intro line and grouped highlights.

# Parameters
- changes
  - Description: The changes shipping in this release.
- audience
  - Description: Who the notes are for (e.g., end users, developers/integrators, internal stakeholders).

# Example Values
changes:
- "webhook support; faster search; timezone fix for email; security patch"

audience:
- End users
- Developers / API integrators

# Notes
- Recommended system prompt: `SYS-A08-change-communication`.
- Constraints: ≤2 params; user-facing register; no internal jargon; no overstatement.
- Related: `USR-A08-change-changelog` (developer-facing list), B-domain tone/style prompts.

# Keywords
release notes, user-facing, highlights, plain language, audience, change communication, A08
