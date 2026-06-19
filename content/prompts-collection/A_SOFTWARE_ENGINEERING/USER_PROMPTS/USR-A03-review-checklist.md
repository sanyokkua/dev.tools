# Prompt ID
USR-A03-review-checklist

# Domain / Category
A — Software Engineering / A03 Code Review

# Description
Single-shot prompt that runs a structured review checklist over a change and reports pass/fail per item.

# Prompt
You are a senior code reviewer. Run the following review checklist against the {{language}} change below and report the status of each item.

Change:
```
{{code}}
```

Checklist (mark ✅ pass / ⚠️ concern / ❌ fail / — N/A, with a one-line reason each):
- Correctness: does it do what it intends, with edge cases handled?
- Design: sound and not over-engineered (solves today's problem)?
- Tests: present, meaningful, covering the change and edge cases?
- Naming & readability: intent-revealing; comments explain WHY?
- Error handling: failures handled and surfaced appropriately?
- Security: input validated; no secrets/injection/authz gaps (where relevant)?
- Performance: no obvious hot-path or N+1 issues (where relevant)?
- Style/consistency: conforms to conventions (defer detail to linters)?

Output: the checklist with statuses and reasons, then the top 3 must-fix items and an overall recommendation.

# Parameters
- language
  - Description: Language of the change.
- code
  - Description: The diff or snippet under review.

# Example Values
language:
- Python 3.12
- Java 21

code:
- "<a service method with a DB call and input parsing>"

# Notes
- Recommended system prompt: `SYS-A03-code-review`.
- Constraints: ≤2 params; checklist is fixed for repeatability.
- Related: `USR-A03-review-change` (free-form), `AGT-A03-review-changes` (in-repo).

# Keywords
code review, checklist, pass fail, correctness, tests, security, repeatable, {{language}}, A03
