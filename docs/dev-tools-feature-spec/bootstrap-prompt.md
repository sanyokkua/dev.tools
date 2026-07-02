# Bootstrap Prompt Template — for use with Claude Code, one per implementation task

This is a fill-in-the-blank prompt template. Copy the block below, replace every `{{PLACEHOLDER}}`, paste in the full text of one task (Goal through Definition of Done), and give the result to Claude Code as the first message of a new session. It instructs Claude Code to plan before touching any code, and only start implementing after you've reviewed and approved the plan.

This template is standalone — it does not assume any other file is open or attached. Everything Claude Code needs to get oriented is either in this template or in the task text you paste into it.

---

## Template (copy everything between the lines)

---

You are working in the `dev.tools` repository — a Next.js 16 (Pages Router), React 19, TypeScript, SCSS static-export developer-tools web app. Before doing anything else, read the repository's own `CLAUDE.md` at the project root — it defines the mandatory verification pipeline, architecture conventions, and available skills you must follow for this work. If a `.claude/skills/` directory exists, check it for a skill matching the kind of change you're about to make (adding a page, adding catalog software, running verification) and follow that skill's process rather than improvising a different one.

The project documentation are in: "docs" and "README.md".
The temporary specification folder for new features are in: "docs/dev-tools-feature-spec".
Prefer using superpowers plugin and skills,

## The work that you need to plan

**Task name:** {{TASK_NAME}}

**Task instructions:**

Instructions should be taken from the file by this path: "docs/dev-tools-feature-spec/implementation-plan.md". Read the "Implementation Plan — Software Installer Overhaul + Dev Environment Setup Page" section for the general context.

Read completely section related to the "Task name". The content in the task section is the content and context required for proper planning of this work.

---

**How I want you to work this session:**

1. **Enter plan mode first.** Do not write or edit any code yet. Read every file this task's instructions mention (and any it implies but doesn't name explicitly — e.g. if the task says "the component that renders X," find and read that component before planning, don't guess at its shape). If the task references a schema, type, or existing function, open the real source and confirm the task's description of it still matches what's actually in the repository today — the task text was written from a point-in-time read of the codebase and may have drifted.

2. **Produce a concrete plan** covering:
    - Every file you will create, and every file you will modify (with a one-line reason per file).
    - The exact data/commands/schema you will use, called out explicitly wherever the task provides them verbatim — use them as given rather than re-deriving your own version, unless you find during investigation that they no longer match the current codebase, in which case flag the discrepancy before proceeding rather than silently reconciling it.
    - The tests you will add or update, and what each one asserts.
    - Which of the task's "edge cases" you will handle and how, one line each.
    - Anything in the task that is ambiguous, underspecified, or appears to conflict with what you found in the actual codebase — list these explicitly and propose your resolution, rather than picking silently and moving on.

3. **Stop and present this plan to me before writing any code.** Do not proceed to implementation until I respond with approval or changes. If I ask for changes, revise the plan and present it again before implementing.

4. **Once approved, implement exactly what the plan describes.** If you discover mid-implementation that reality diverges from the plan in a way that changes the approach, stop and tell me rather than silently improvising a fix and continuing.

5. **Before declaring the task done, run the full mandatory verification sequence** (check `CLAUDE.md` for the exact current commands, but at minimum this means: format/lint/test → production build → any service-worker/precache validation script → the responsive/console-error UI check across all breakpoints and both light/dark themes → any interaction smoke tests). Fix every failure this surfaces, including failures that existed before your change and that you didn't cause — this repository's own policy is that "pre-existing" is not a valid reason to leave a failure unfixed; it's a reason to fix it now or explicitly flag it to me as a separate tracked issue if fixing it is out of scope for this task.

6. **Commit only after verification is fully green**, with a clear commit message describing what changed and why, and confirm `git status` is clean afterward.

7. **Report back concisely** at the end: what you built, which files changed, what you tested, the verification results, and anything you flagged as ambiguous/out-of-scope along the way. I don't need a narrated replay of every step you took — just the outcome and anything I need to know or decide.

If anything in the task instructions above is unclear, or if your investigation of the actual codebase turns up something the task didn't anticipate, ask me before guessing — don't silently pick an interpretation and run with it, especially for anything touching the public API shape of a shared catalog/schema file that other parts of the app also depend on.

Note: You are already in the feature branch. You do not merge or push changes. You only allowed to do commits in this branch.

---
