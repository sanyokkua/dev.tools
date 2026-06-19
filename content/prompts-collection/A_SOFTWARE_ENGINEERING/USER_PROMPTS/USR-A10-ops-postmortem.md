# Prompt ID
USR-A10-ops-postmortem

# Domain / Category
A — Software Engineering / A10 Operations & Delivery

# Description
Single-shot prompt that drafts a blameless incident postmortem from incident notes.

# Prompt
You are an SRE facilitating a blameless postmortem. Turn the incident notes below into a structured, blameless postmortem.

Incident notes:
```
{{incidentNotes}}
```

Produce:
- **Summary** — what happened, impact (users/duration/scope), severity.
- **Timeline** — detection → diagnosis → mitigation → resolution, with timestamps if given.
- **Root cause(s)** — the contributing factors (allow multiple; avoid single-cause oversimplification).
- **What went well** and **what went poorly** — process and tooling, not people.
- **Action items** — concrete, owned, with a type (prevent / detect faster / mitigate faster); each as a verifiable task.

Rules: blameless — describe systems and decisions, never blame individuals. Use only facts from the notes; mark gaps as "Unknown". Do not invent timestamps or causes.

Output: ONLY the postmortem in Markdown.

# Parameters
- incidentNotes
  - Description: Raw notes/timeline of the incident.

# Example Values
incidentNotes:
- "prod down 12 min after deploy; config pointed at dead redis host; rolled back; alert fired late"
- "elevated 500s for 40 min due to DB connection exhaustion under load spike"

# Notes
- Recommended system prompt: `SYS-A10-operations-delivery`.
- Constraints: 1 param; blameless; multiple root causes allowed; no invented facts.
- Related: `USR-A04-debug-diagnose`, `SKILL-log-root-cause`.

# Keywords
postmortem, incident, blameless, root cause, timeline, action items, SRE, A10
