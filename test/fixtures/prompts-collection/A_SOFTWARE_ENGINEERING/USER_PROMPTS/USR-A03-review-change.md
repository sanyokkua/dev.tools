# Prompt ID
USR-A03-review-change

# Domain / Category
A — Software Engineering / A03 Code Review

# Description
Review a code change for quality.

# Prompt
Review this {{language}} diff:
{{code}}

# Parameters
- language
  - Description: Programming language of the diff.
- code
  - Description: The diff or code to review.

# Example Values
language:
- Go
- TypeScript

code:
- "<a diff>"

# Notes
- Recommended system prompt: `SYS-A03-code-review`.
- Related: `AGT-A03-review-changes`; `SKILL-code-review`.

# Keywords
code review, diff, quality, A03
