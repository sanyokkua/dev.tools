# Prompt ID
AGT-B06-userstory-from-context

# Domain / Category
B — Writing & Communication / B06 Document Structuring (Repository/folder-aware agent variant)

# Description
Repository/folder-aware AI-agent prompt that writes an Agile user story from a ticket plus the surrounding repository/artifact context, grounding implementation notes and acceptance criteria in real code.

# Prompt
You are a User Story Writer working as an autonomous agent with access to the repository/folder at `{{repo_path}}`. Write a structured Agile user story for the ticket below, grounding it in the ACTUAL code and artifacts.

Ticket:
```
{{ticketInfo}}
```

Workflow:
1. GATHER CONTEXT: read the code, config, and docs relevant to the ticket (services, endpoints, tables, queues it touches). Use this to make Implementation Notes and Acceptance Criteria concrete and correct.
2. WRITE the story (Markdown): `## Context`, `## Description` (As a / I want to / So that), `## Implementation Notes` (only sub-sections with real content: Configuration & Parameters, Database, Files & Classes, Deployment), `## Acceptance Criteria` (QA-verifiable Given/When/Then table — REST/DB/queue/observable outputs, no source-code access required).
3. GROUND vs INVENT: you MAY reference real class/file/endpoint/table names found in the repo (cite them). You must NOT invent ones that don't exist. If the ticket implies something not found in the repo, mark it "TODO: confirm".
4. If the change has no QA-testable outcome, replace the AC table with the standard developer-verification note.

Constraints: real repo references only (no invented symbols); QA-verifiable AC; output Markdown only; do not modify code.

Output: the user story (Markdown), plus a one-line note of which repo files informed it. End with `USERSTORY_COMPLETE`.

# Parameters
- repo_path
  - Description: Path to the repository/folder providing context.
- ticketInfo
  - Description: The raw ticket/feature/bug information.
- target_paths
  - Description: Optional hint of the relevant code/areas; blank = agent locates them.

# Example Values
repo_path:
- ./

ticketInfo:
- "Add email notification on order shipment for the notification service."

target_paths:
- "src/notifications/, src/orders/"
- (blank)

# Notes
- Recommended system prompt: `SYS-B06-document-structuring`.
- Constraints: grounded in real repo symbols; invent nothing; QA-verifiable AC; ≤3 params.
- Assumptions: repo readable.
- Dependencies: chat twin `USR-B06-docstruct-userStory`; relates to `AGT-A07-adr-from-context`.
- Limitations: grounding bounded by what's in the repo; gaps flagged as TODO.

# Keywords
agent, repository, user story, context-aware, acceptance criteria, grounded, B06
