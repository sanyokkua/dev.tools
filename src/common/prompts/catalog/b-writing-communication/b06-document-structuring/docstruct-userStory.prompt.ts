import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-B06-docstruct-userStory',
    categoryCode: 'B06',
    title: 'Write an Agile User Story',
    subtitle: 'Context, description, implementation notes, QA-verifiable acceptance criteria — invent nothing.',
    description: 'Context, description, implementation notes, QA-verifiable acceptance criteria — invent nothing.',
    variantAxes: ['mode'],
    defaultVariantId: 'USR-B06-docstruct-userStory',
    modeClass: 'dual',
    variants: [
        {
            id: 'USR-B06-docstruct-userStory',
            kind: 'user',
            categoryCode: 'B06',
            title: 'Write an Agile User Story',
            description: 'Write an Agile User Story',
            template: `You are a User Story Writer. Transform the raw ticket information below into a structured Agile user story in Markdown. Output ONLY the Markdown — no preamble.

Rules:
- Use ONLY information present in the input. Do not invent class names, endpoints, table names, ticket numbers, links, values, or queue names. If a field has no information, omit it (do not leave template placeholders).
- Always include: \`## Context\`, \`## Description\` (with "As a / I want to / So that" derived from the content — use "system" or the service name as the persona for purely technical stories), \`## Implementation Notes\` (orientation only; include only sub-sections that have content: Configuration & Parameters, Database, Files & Classes, Deployment & Infrastructure Notes), and \`## Acceptance Criteria\`.
- Acceptance Criteria must be Quality Assurance (QA)-verifiable WITHOUT source-code access (Representational State Transfer (REST) calls, database queries, queue inspection, observable outputs, config checks), in a Given/When/Then table. If the change has no QA-testable outcome (pure config/dependency/infra change), replace the table with: \`> This story does not produce QA-testable outcomes. Verification is performed by the development team.\`
- Include any provided Data Definition Language (DDL) / Data Manipulation Language (DML) / Structured Query Language (SQL) verbatim in the appropriate Implementation Notes sub-section. Include a regression-criterion row if existing behavior must be preserved.

Ticket information:
'''
{{ticketInfo}}
'''

If there is no processable input, return \`[NO_TEXT_PROVIDED]\`.
`,
            parameters: [
                {
                    name: 'ticketInfo',
                    control: 'textarea',
                    optional: false,
                    label: 'Raw ticket information',
                    description: 'The raw ticket/feature/bug information to turn into a user story.',
                },
            ],
            examples: {
                ticketInfo: [
                    'Service: Order Notification. Add email on shipment; template in notifications.email_template (TEXT), null → default; new POST /notifications/email. Tech: Java 17, Spring Boot 3.1, Postgres.',
                    `Bug: PaymentProcessor NullPointerException when refund event has no \`reason\` (optional); handler calls getReason().trim() without null check; fix: add null check.`,
                ],
            },
            keywords: [],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-B06-document-structuring',
            relatedPromptIds: ['LP-B06-docstruct-spec'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'AGT-B06-userstory-from-context',
            kind: 'agent',
            categoryCode: 'B06',
            title: 'Agent: Write an Agile User Story',
            description: 'Agent: Write an Agile User Story',
            template: `You are a User Story Writer working as an autonomous agent with access to the repository/folder at \`{{repo_path}}\`. Write a structured Agile user story for the ticket below, grounding it in the ACTUAL code and artifacts.

Ticket:
\`\`\`
{{ticketInfo}}
\`\`\`
Relevant code/areas (blank = locate them yourself): {{target_paths}}

Workflow:
1. GATHER CONTEXT: read the code, config, and docs relevant to the ticket (services, endpoints, tables, queues it touches). Use this to make Implementation Notes and Acceptance Criteria concrete and correct.
2. WRITE the story (Markdown): \`## Context\`, \`## Description\` (As a / I want to / So that), \`## Implementation Notes\` (only sub-sections with real content: Configuration & Parameters, Database, Files & Classes, Deployment), \`## Acceptance Criteria\` (Quality Assurance (QA)-verifiable Given/When/Then table — Representational State Transfer (REST) / database / queue / observable outputs, no source-code access required).
3. GROUND vs INVENT: you MAY reference real class/file/endpoint/table names found in the repo (cite them). You must NOT invent ones that don't exist. If the ticket implies something not found in the repo, mark it \`TODO: confirm\`.
4. If the change has no QA-testable outcome, replace the AC table with the standard developer-verification note.

Constraints: real repository references only (no invented symbols); QA-verifiable acceptance criteria; output Markdown only; do not modify code.

Output: the user story (Markdown), plus a one-line note of which repository files informed it. End with the line \`USERSTORY_COMPLETE\`.
`,
            parameters: [
                {
                    name: 'repo_path',
                    control: 'text',
                    optional: false,
                    label: 'Repository/folder for context',
                    description: 'Path to the repository/folder providing context.',
                },
                { name: 'ticketInfo', control: 'textarea', optional: false, label: 'Raw ticket information' },
                {
                    name: 'target_paths',
                    control: 'text',
                    optional: true,
                    label: 'Relevant code/areas (optional)',
                    description: 'Hint of the relevant code/areas; blank = the agent locates them.',
                },
            ],
            examples: {
                repo_path: ['./'],
                ticketInfo: ['Add email notification on order shipment for the notification service.'],
                target_paths: ['src/notifications/, src/orders/', ''],
            },
            keywords: [],
            executionContext: 'agent',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-B06-document-structuring',
            relatedPromptIds: ['LP-B06-docstruct-spec'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
