import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A10-postmortem',
    categoryCode: 'A10',
    title: 'Write a Blameless Postmortem',
    subtitle: 'A structured, blameless incident postmortem from notes',
    description: 'A structured, blameless incident postmortem from notes',
    variantAxes: [],
    defaultVariantId: 'USR-A10-ops-postmortem',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A10-ops-postmortem',
            kind: 'user',
            categoryCode: 'A10',
            title: 'Write a Blameless Postmortem',
            description: 'Write a Blameless Postmortem',
            template: `You are a Site Reliability Engineer (SRE) facilitating a blameless postmortem. Turn the incident notes below into a structured, blameless postmortem.

Incident notes:
\`\`\`
{{incidentNotes}}
\`\`\`

Produce:
1. **Summary** — what happened, impact (users/duration/scope), severity.
2. **Timeline** — detection → diagnosis → mitigation → resolution, with timestamps if given.
3. **Root cause(s)** — the contributing factors (allow multiple; avoid single-cause oversimplification).
4. **What went well** and **what went poorly** — process and tooling, not people.
5. **Action items** — concrete, owned, with a type (prevent / detect faster / mitigate faster); each as a verifiable task.

Rules: blameless — describe systems and decisions, never blame individuals. Use only facts from the notes; mark gaps as "Unknown". Do not invent timestamps or causes.

Output contract: ONLY the postmortem in Markdown.
`,
            parameters: [
                {
                    name: 'incidentNotes',
                    label: 'Incident notes',
                    description: 'Raw notes/timeline of the incident',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                incidentNotes: [
                    'prod down 12 min after deploy; config pointed at dead redis host; rolled back; alert fired late',
                    'elevated 500s for 40 min due to DB connection exhaustion under load spike',
                ],
            },
            keywords: ['postmortem', 'incident', 'blameless', 'root cause', 'timeline', 'action items', 'SRE', 'A10'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A10-operations-delivery',
            relatedPromptIds: ['LP-A04-diagnose'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
