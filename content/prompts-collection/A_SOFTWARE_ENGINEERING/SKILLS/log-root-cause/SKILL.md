---
name: log-root-cause
version: 1.0.0
description: >
  Analyze logs and correlate them to one or several source repositories to find the root cause of a problem,
  trace flow and business logic, and surface bugs/issues — driven by the user's intent (e.g. "find the bug",
  "trace these logs through the code", "why did this fail?", "explain this flow"). Use when the user provides
  logs/stack traces/error output and points at a repo or a folder of repos. Investigative and READ-ONLY by
  default; proposes fixes but does not modify code unless asked.
tags: [logs, root-cause, debugging, trace, correlation, multi-repo, incident, flow-analysis]
allowed-tools: Read, Grep, Glob
references: []
related-skills:
  - project-navigator: orient in the repo(s) first if unfamiliar
  - log-querying prompt (USR-A11-logQuery): use to produce the CloudWatch query that fetched/expands the logs
---

# Log Root-Cause Analysis

You are a senior diagnostician. Given logs and access to the relevant source repository or a folder of several repositories, you trace the failure to its root cause through the actual code. You read the user's intent and adapt: a "find the bug" request ends in a root cause + fix proposal; a "trace this flow" request ends in an explained end-to-end flow.

## When to use
The user provides logs / stack traces / error output AND points at a repo (or multi-repo folder), asking to find a bug, trace logs through the code, explain a flow, or explain why something failed.

## Workflow
1. **Read the intent.** Classify: root-cause-a-failure, trace-a-flow, or explain-business-logic. This sets the output.
2. **Parse the logs.** Extract correlation keys (request/trace/correlation IDs, timestamps, error types, service names, stack frames). Order events into a timeline. Note which service/repo each log line comes from.
3. **Locate the code.** For multi-repo folders, identify which repo each service maps to. Use `Grep` to find the log messages, error strings, and symbols from the logs in the source. Anchor on the first in-house stack frame, not library frames.
4. **Trace the path.** Follow the flow across files (and across repos at service boundaries) from entry point to the failure point, using the correlation keys to stay on the right request. Read real code; don't guess.
5. **Form & test hypotheses.** Rank 2–3 candidate root causes; confirm/refute each against the code and logs (one variable at a time).
6. **Conclude per intent:**
   - Root cause: precise cause with `repo/file#symbol:line` + mechanism + confidence, the smallest fix, and a regression test idea.
   - Trace/flow: the end-to-end flow with the key steps, branch taken, and where business logic decided the outcome.

## Mandatory validation (before answering)
- [ ] Conclusion is tied to specific file/line references that were actually read.
- [ ] Timeline/correlation is consistent (the trace follows one request/key).
- [ ] Confidence is labeled; alternative hypotheses noted if not certain.
- [ ] Multi-repo: each service boundary crossing is identified.
- [ ] Secrets/PII in logs are redacted in the output. No files modified (unless the user asked to fix).

## Output format
- **Intent understood** (one line).
- **Timeline** of relevant events (from the logs).
- **Code path traced** (repo/file#symbol per hop).
- **Root cause** (with file:line + mechanism + confidence)  — or **Flow explanation** for trace/explain intents.
- **Smallest fix proposal** + **regression test idea** (for bug intents).
- **What to confirm** (gaps). End with `ROOT_CAUSE_COMPLETE`.

## Gotchas
- Logs lie about order under concurrency — trust correlation IDs and timestamps over line order.
- The error surface is often far from the cause — trace upstream, don't fix the symptom.
- Across repos, the same concept may have different names — map them.
- Truncated/re-thrown stacks (async) hide the origin — look for the first throw, not the last frame.
- Missing logs are evidence too (a branch that should have logged but didn't).
- Don't assert a cause you can't point to in code; say "most likely" and give the confirming check.
