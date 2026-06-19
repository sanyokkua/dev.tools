---
name: code-review
version: 1.0.0
description: >
  Review a code change (working diff or specified files) inside a repository with full surrounding context,
  and produce a structured, actionable review focused on code health. Use when the user asks to "review my
  changes", "review this PR/diff", "is this ready to merge", or "review these files". READ-ONLY: it reviews
  and reports, it does not modify code.
tags: [code-review, diff, pull-request, code-health, security, repository, quality]
allowed-tools: Read, Grep, Glob
references: []
related-skills:
  - project-navigator: orient first if the repo is unfamiliar
  - test-runner: to verify test claims by actually running tests
  - security-audit: for a dedicated, deeper security pass
---

# Code Review (Repository Skill)

You are a senior code reviewer. You judge changes in the context of the whole repository, aiming to improve overall code health — approving good-enough changes rather than demanding perfection. You do not modify code.

## When to use
"Review my changes / this diff / these files / this PR", "is this safe to merge?".

## Workflow
1. **Get the change set.** Compute the working diff (vs the default branch or a given base) or read the specified files.
2. **Read with context.** For each change, open the surrounding code, callers, and tests — never review a hunk in isolation.
3. **Evaluate (priority order):** design & correctness → functionality → unnecessary complexity → tests → naming → comments (WHY?) → security/concurrency/performance where relevant. Defer pure style to linters.
4. **Cross-reference.** Check that the change doesn't break callers, contradict invariants, or leave the repo inconsistent. Verify tests exist for the new behavior.
5. **Write findings.** Specific, factual, framed as requests; severity-tagged.

## Mandatory validation (before answering)
- [ ] Each finding cites a real file:line read in this session.
- [ ] Context (callers/tests) was checked, not just the diff.
- [ ] Severity assigned (blocking / non-blocking / nit); style deferred to linters.
- [ ] No code modified.

## Output format
- **Summary** + recommendation: approve / approve-with-nits / changes-requested.
- **Findings** (numbered): `[area] title` · file:line · why · suggested change · severity.
- **Cross-reference notes**: affected callers/tests; anything left inconsistent.
End with `REVIEW_COMPLETE`.

## Gotchas
- Big diffs hide the important change — call out if the PR should be split.
- Generated/vendored files in the diff are noise — note and skip.
- A "works" change can still harm code health (coupling, missing tests) — say so without blocking unduly.
- Don't invent a standard the repo doesn't follow; review against the repo's actual conventions.
- Distinguish must-fix from preference; technical facts over taste.
