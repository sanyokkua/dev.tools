# dev.tools — how to work here

## Where this stands

Browser-based developer utilities for text, code, setup, and AI workflows. The app is client-only,
installable as a PWA, and deployed as a static site to GitHub Pages.

**Stack.** Next.js 16 Pages Router, React 19, TypeScript, SCSS, Monaco, Jest, and Playwright.

**State.** This is a running application. Routes live under `src/pages/`; there is no server API or
database. The current unit of work is tracked in the task/PR, not in a committed SDD framework.

**The spec is the authority.** Use the current task/PR acceptance criteria and edge cases. Record
durable project history in `CHANGELOG.md`. If the spec is silent on a required decision, stop and
ask with a recommended default.

## The loop

Six phases. No feature code before PLAN is complete.

| Phase  | Exit condition                                                         | Command                                                       |
| ------ | ---------------------------------------------------------------------- | ------------------------------------------------------------- |
| ORIENT | Read current state and name the unit of work                           | Read `README.md`, `docs/DEVELOPER_GUIDE.md`, and `git status` |
| SPEC   | Written acceptance criteria and edge cases exist                       | Record them in the task/PR                                    |
| PLAN   | Ordered tasks exist; one task = one branch = one commit                | Write the task list                                           |
| BUILD  | Each task is implemented and individually verified                     | Use the relevant repository skill                             |
| VERIFY | The gate is green and behavior matches the spec                        | `npm run verify`                                              |
| CLOSE  | Work is reported, durable docs are updated, and the next unit is named | Update the task/PR and `CHANGELOG.md` when needed             |

For static-export, service-worker, or UI changes, follow the complete `run-verification` skill in
addition to the baseline gate.

**Advance without asking.** Stop only when the spec is ambiguous, the same gate failure survives
one retry, a costly architectural decision is required, an action is irreversible or leaves the
repo, or new information contradicts the approved spec.

## Definition of Done

**Gate:** `npm run verify` — the existing format, lint, path, and Jest pipeline.

A unit is done when the gate is green and the implementation matches the spec. Tests passing
against the wrong behavior is not done.

- Capture the baseline before work; distinguish new findings from existing findings.
- Run the full verification skill when a change affects startup, shared fixtures, public interfaces,
  static export, the service worker, or live UI behavior.
- Treat a materially long-running check as a hang: stop it and diagnose it.

Closing evidence:

- [ ] Acceptance criteria are named and each has a proving test or check.
- [ ] Every plan task is complete.
- [ ] The applicable gate is green and compared with the baseline.
- [ ] Public-surface docs or decisions are updated.
- [ ] The next step is stated.

## Git protocol

```
master                         protected; do not develop or commit here
  └── feature/<slug>           parent branch for one unit of work
        └── feature/<slug>--<task>  one task branch and one commit
```

1. Start work from `master` on `feature/<slug>`; use an existing suitable feature branch when one exists.
2. Create a task branch before changing files. Use `--` between the parent and task name.
3. Commit only on task branches, with one focused Conventional Commit per plan task.
4. Verify before merging a task into its parent; delete task branches when the repository convention allows it.
5. Never merge the parent into `master`; final review and merge belong to the user.
6. Never use `--no-verify` or force-push to bypass a problem.

## Delegation

The main session owns the plan, decisions, and judgment about completion. Delegate file dumps,
broad searches, implementation task groups, test writing, and independent conformance reviews.

Brief every delegated task with the objective, output format, where to look, and what not to touch.
State the constraint most likely to be violated; subagents inherit neither this conversation nor
its decisions. Use eight or fewer agents per batch.

## Non-negotiables

| Rule                                                   | Enforced by                                            |
| ------------------------------------------------------ | ------------------------------------------------------ |
| Shared Claude/Codex files have one canonical source    | `python3 scripts/sync-agent-files.py --check` (manual) |
| Gate green before reporting a unit done                | `npm run verify` (manual)                              |
| Generated prompt manifests are not committed           | `.gitignore` and `npm run build:prompts`               |
| Static-export work must pass service-worker validation | `npm run validate:sw` after `npm run build`            |
| Never edit `package-lock.json` directly                | — (advisory)                                           |
| Never bypass hooks or history protection               | — (advisory)                                           |

## End every turn with Next step

Every turn that advances the work ends with this block:

```markdown
## Next step

**State:** <actual state with evidence>
**Command:** `<exact command>` — or "none — decision needed from you"
**Prompt:**

> <self-contained prompt naming the unit, artifacts to read, and the constraint most likely to be violated>
```

Be honest when work is unverified. A decision is a valid next step; never invent a command to look productive.

## What will bite you

- **`npm run verify` stages files.** It runs formatting and `git add .`; inspect the staged diff so unrelated work is not accidentally included.
- **Service-worker validation depends on a build.** Run `npm run build` before `npm run validate:sw`; otherwise the generated worker or chunks may be missing.
- **UI verification needs a live app.** `npm run verify:ui` expects a running dev server and a live browser; it also writes screenshots under `.tmp/verify-screens/`.
- **Prompt catalog output is generated.** Edit catalog sources, run `npm run build:prompts`, and do not commit the ignored manifest or loader output.
- **Documentation counts can drift.** Derive route inventories from `src/pages/` instead of trusting old numeric summaries.
- **The lockfile is npm-owned.** Change dependencies through npm so `package.json` and `package-lock.json` stay consistent.

## Where things live

- Task specification and acceptance criteria: the current task/PR
- Durable project history: `CHANGELOG.md`
- Repository docs: `README.md` and `docs/`
- Canonical shared skills: `.agents/skills/`
- Claude/Codex skill entry points: `.claude/skills` and `.codex/skills`
- Claude agent sources and generated Codex agents: `.claude/agents/` and `.codex/agents/`
- Synchronization checker: `scripts/sync-agent-files.py`
