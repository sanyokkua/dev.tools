# Prompt ID
USR-A08-change-pr

# Domain / Category
A — Software Engineering / A08 Change Communication

# Description
Single-shot prompt that writes (or improves) a pull-request description covering what changed, why, and how it was tested.

# Prompt
You are an engineering communication editor. Write a clear pull-request description for the change below.

Change summary (or an existing rough PR description to improve):
```
{{changeSummary}}
```

Produce:
- **What & why** — what the change does and the motivation (the problem it solves). Focus on what/why, not a line-by-line how.
- **Changes** — a short bullet list of the notable changes (user-visible or structural).
- **Testing** — how it was verified (tests added/run, manual steps), and screenshots placeholder if UI.
- **Notes for reviewers** — anything to focus on, risks, or follow-ups.
- **Linked issues** — only if present in the input.

Rules: concise, semi-formal, professional. Use only facts from the input; mark unknowns as "TODO". Do not invent ticket numbers or test results.

Output: ONLY the PR description in Markdown.

# Parameters
- changeSummary
  - Description: Summary of the change (or an existing PR description to refine).

# Example Values
changeSummary:
- "adds email notifications on order shipment, with fallback template; new POST /notifications/email"
- "refactor: extract validation from the order handler; no behavior change"

# Notes
- Recommended system prompt: `SYS-A08-change-communication`.
- Constraints: 1 param; what+why+testing; no invented results.
- Related: `USR-A03-review-selfReview` (before writing), `AGT-A08-commit-and-pr`.

# Keywords
pull request, PR description, what why testing, review, change communication, A08
