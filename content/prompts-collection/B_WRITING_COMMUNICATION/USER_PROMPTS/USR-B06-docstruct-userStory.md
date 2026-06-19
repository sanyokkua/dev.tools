# Prompt ID
USR-B06-docstruct-userStory

# Domain / Category
B — Writing & Communication / B06 Document Structuring

# Description
Single-shot prompt that transforms raw ticket information into a structured Agile user story in Markdown, with QA-verifiable acceptance criteria, inventing nothing.

# Prompt
You are a User Story Writer. Transform the raw ticket information below into a structured Agile user story in Markdown. Output ONLY the Markdown — no preamble.

Rules:
- Use ONLY information present in the input. Do not invent class names, endpoints, table names, ticket numbers, links, values, or queue names. If a field has no information, omit it (do not leave template placeholders).
- Always include these sections: `## Context`, `## Description` (with "As a / I want to / So that" derived from the content — use "system" or the service name as persona for purely technical stories), `## Implementation Notes` (orientation only; include only sub-sections that have content: Configuration & Parameters, Database, Files & Classes, Deployment & Infrastructure Notes), and `## Acceptance Criteria`.
- Acceptance Criteria must be QA-verifiable WITHOUT source-code access (REST calls, DB queries, queue inspection, observable outputs, config checks), in a Given/When/Then table. If the change has no QA-testable outcome (pure config/dependency/infra change), replace the AC table with: `> This story does not produce QA-testable outcomes. Verification is performed by the development team.`
- Include any provided DDL/DML/SQL verbatim in the appropriate Implementation Notes sub-section. Include a regression-criterion row if existing behavior must be preserved.

Ticket information:
<<<START>>>
{{ticketInfo}}
<<<END>>>

If there is no processable input, return `[NO_TEXT_PROVIDED]`.

# Parameters
- ticketInfo
  - Description: The raw ticket/feature/bug information to turn into a user story.

# Example Values
ticketInfo:
- "Service: Order Notification. Add email on shipment; template in notifications.email_template (TEXT), null → default; new POST /notifications/email. Tech: Java 17, Spring Boot 3.1, Postgres."
- "Bug: PaymentProcessor NPE when refund event has no `reason` (optional); handler calls getReason().trim() without null check; fix: add null check."

# Notes
- Recommended system prompt: `SYS-B06-document-structuring`.
- Constraints: 1 param; invent nothing; QA-verifiable AC; output Markdown only.
- Related: `AGT-B06-userstory-from-context` (derives the story from a repo + ticket); `USR-B06-docstruct-spec`.
- This is a rich, single-shot prompt: long template, one parameter — by design.

# Keywords
user story, agile, acceptance criteria, QA-verifiable, ticket, Given When Then, B06
