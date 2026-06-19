# Prompt ID
AGT-B09-status-from-activity

# Domain / Category
B — Writing & Communication / B09 Workplace Communication (Repository-aware agent variant)

# Description
Repository-aware AI-agent prompt that drafts a status update / standup from actual recent repository activity (commits, branches, changed files).

# Prompt
You are a workplace-communication editor working as an autonomous agent with access to the repository at `{{repo_path}}`. Draft a status update from the ACTUAL recent activity.

Period: {{period}}  (e.g., "since yesterday", "this week", "since <ref>")

Workflow:
1. GATHER activity for the period: recent commits (messages + changed areas), merged/open branches, and notable changed files. Read commit messages and, where needed, the diffs to understand WHAT was accomplished (outcomes), not just file churn.
2. SYNTHESIZE into a status update structured as **Done** / **In progress** / **Blockers / Next** (or yesterday/today/blockers if a standup is requested). Describe outcomes in plain language, grouping related commits.
3. GROUND in real activity: do NOT invent work, progress, or blockers not evidenced by the repo. If blockers aren't discoverable from the repo, note that they should be added by the author.

Constraints: outcomes over raw commit lists; grounded in actual activity; no invented progress; concise and audience-appropriate; read-only.

Output: the status update (Markdown) + a one-line note of the activity range/source used. End with `STATUS_COMPLETE`.

# Parameters
- repo_path
  - Description: Path to the repository.
- period
  - Description: The time window/ref to summarize activity for.
- user_intent
  - Description: Optional format — "status update" (default) or "standup".

# Example Values
repo_path:
- ./

period:
- "this week"
- "since main"

user_intent:
- "status update"
- "standup"

# Notes
- Recommended system prompt: `SYS-B09-workplace-communication`.
- Constraints: grounded in real commits/diffs; outcomes; no invented blockers; ≤3 params; read-only.
- Assumptions: git history is available for the period.
- Dependencies: chat twins `USR-B09-work-statusUpdate`/`-standup`; relates to `AGT-A08-commit-and-pr`.
- Limitations: blockers/plans not in the repo must be supplied by the author.

# Keywords
agent, repository, status update, standup, commit activity, outcomes, B09
