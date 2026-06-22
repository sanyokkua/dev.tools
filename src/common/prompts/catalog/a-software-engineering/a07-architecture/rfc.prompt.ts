import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A07-rfc',
    categoryCode: 'A07',
    title: 'Write a Request for Comments (RFC)',
    subtitle: 'A design proposal that explores options before deciding',
    description: 'A design proposal that explores options before deciding',
    variantAxes: [],
    defaultVariantId: 'USR-A07-arch-rfc',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A07-arch-rfc',
            kind: 'user',
            categoryCode: 'A07',
            title: 'Write a Request for Comments (RFC)',
            description: 'Write a Request for Comments (RFC)',
            template: `You are a software architect. Draft a Request for Comments (RFC, a design proposal) for the problem below. An RFC explores options BEFORE a decision and invites comment — it does not just assert a choice.

Problem / proposal:
\`\`\`
{{problem}}
\`\`\`

Options to consider (if given): {{options}}

Produce:
1. **Summary** — the problem and what's being proposed, in a few sentences.
2. **Context & goals** — why now; the requirements and quality attributes that matter.
3. **Options** — at least two genuine options; for each: how it works, pros, cons, cost/risk.
4. **Recommendation** — the proposed option and why, with the trade-offs accepted.
5. **Open questions** — what reviewers should weigh in on.

Rules: present options fairly (no strawmen); support positions with reasons; use only facts from the input, marking gaps as "TODO: confirm".

Output contract: ONLY the RFC in Markdown.

Worked example —
Input problem: "How should we deliver async work: queue vs event bus vs DB outbox?"
Expected (excerpt): Summary + Context; Options — (1) managed queue: simple, at-least-once, no fan-out; (2) event bus: fan-out, more ops; (3) DB outbox: transactional consistency, polling lag. Recommendation: "outbox + queue for transactional consistency, accepting polling latency"; Open questions: "expected throughput? need fan-out to multiple consumers?".
`,
            parameters: [
                {
                    name: 'problem',
                    label: 'Problem / proposal',
                    description: 'The problem/change to propose and explore',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'options',
                    label: 'Options to consider',
                    description: 'Optional candidate options; blank = propose them',
                    control: 'textarea',
                    optional: true,
                },
            ],
            examples: {
                problem: [
                    'How should we deliver async work: queue vs event bus vs DB outbox?',
                    'Introduce caching for the product catalog read path.',
                ],
                options: ['managed queue | Kafka | DB outbox'],
            },
            keywords: ['RFC', 'design proposal', 'options', 'recommendation', 'exploration', 'A07'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A07-architecture',
            relatedPromptIds: ['LP-A07-adr', 'LP-A07-tradeoff'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
