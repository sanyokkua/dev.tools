import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A07-adr',
    categoryCode: 'A07',
    title: 'Write an Architecture Decision Record (ADR)',
    subtitle: 'Nygard-format ADR — chat + repository-aware agent twin',
    description: 'Nygard-format ADR — chat + repository-aware agent twin',
    variantAxes: ['mode'],
    defaultVariantId: 'USR-A07-arch-adr',
    modeClass: 'dual',
    variants: [
        {
            id: 'USR-A07-arch-adr',
            kind: 'user',
            categoryCode: 'A07',
            title: 'Write an Architecture Decision Record (ADR)',
            description: 'Write an Architecture Decision Record (ADR)',
            template: `You are a software architect. Draft an Architecture Decision Record (ADR) for the decision below, using the Nygard format.

Decision being made:
\`\`\`
{{decision}}
\`\`\`

Context (forces, constraints, alternatives considered):
\`\`\`
{{context}}
\`\`\`

Produce these sections:
1. **Title** — \`ADR-NNNN: <short noun phrase naming the decision>\` (use a placeholder number).
2. **Status** — Proposed (note if it supersedes another ADR).
3. **Context** — the value-neutral facts and forces at play (what makes this decision necessary).
4. **Decision** — active voice: "We will…".
5. **Consequences** — ALL of them: positive, negative, and neutral. Do not hide the negatives.

Rules: capture ONE decision. Keep it short (1–2 pages). Use only facts from the input; mark gaps as "TODO: confirm". ADRs are immutable once accepted — this records the decision as of now.

Output contract: ONLY the ADR in Markdown.

Worked example —
Input decision: "Use idempotency keys on all payment write endpoints."; context: "Mobile retries cause duplicate charges; at-least-once delivery; small team."
Expected output: \`# ADR-0007: Idempotency keys on payment write endpoints\` · Status: Proposed · Context: "Mobile clients on flaky networks retry; at-least-once delivery; duplicate charges observed." · Decision: "We will require an \`Idempotency-Key\` header on all payment write endpoints and store keys for 24h to deduplicate." · Consequences: +(no duplicate charges), −(added storage + key lifecycle to maintain), neutral(clients must generate keys).
`,
            parameters: [
                {
                    name: 'decision',
                    label: 'Decision being made',
                    description: 'The architectural decision to record',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'context',
                    label: 'Context (forces, constraints, alternatives)',
                    description: 'The forces, constraints, and alternatives that shaped it',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                decision: [
                    'Use idempotency keys on all payment write endpoints.',
                    'Adopt a modular monolith instead of microservices for v1.',
                ],
                context: ['Mobile retries cause duplicate charges; at-least-once delivery; small team.'],
            },
            keywords: ['ADR', 'architecture decision record', 'Nygard', 'context', 'decision', 'consequences', 'A07'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A07-architecture',
            relatedPromptIds: ['LP-A07-tradeoff', 'LP-A07-rfc'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'AGT-A07-adr-from-context',
            kind: 'agent',
            categoryCode: 'A07',
            title: 'Agent: Write an Architecture Decision Record (ADR)',
            description: 'Write an Architecture Decision Record (ADR)',
            template: `You are a software architect working as an autonomous agent INSIDE the repository at \`{{repo_path}}\`. Produce an Architecture Decision Record (ADR) for the decision below, grounded in the repository's actual context.

Decision to record / question to decide:
\`\`\`
{{decision}}
\`\`\`
Relevant code/requirements (optional): {{target_paths}}

Workflow:
1. GATHER CONTEXT: traverse and read relevant code, configuration, requirement/spec docs, and any existing ADRs (e.g., under \`docs/adr/\`). Identify the real forces and constraints in THIS codebase. Cite real paths. Cross-reference: does this decision conflict with or supersede an existing ADR? If so, reference it.
2. If the decision is not yet made (it's a question), briefly compare ≥2 options grounded in the repo's constraints, then record the recommended one.
3. WRITE the ADR in Nygard format — Title (\`ADR-NNNN: …\`, next sequential number found in the repo) · Status (Proposed; note supersession) · Context (value-neutral facts) · Decision ("We will…") · Consequences (positive, negative, neutral — all of them).
4. SAVE it to the repo's ADR directory (e.g., \`docs/adr/adr-NNNN-*.md\`), creating the directory if needed. Do not edit accepted ADRs in place — supersede.

Constraints: one decision per ADR; use only facts from the repo/input (mark gaps "TODO: confirm"); never invent ticket numbers or prior ADRs; append-only.

Output (summary): the ADR content, the path written, the next ADR number used, and any ADR it supersedes/relates to. End with \`ADR_COMPLETE\`.
`,
            parameters: [
                {
                    name: 'repo_path',
                    label: 'Repository path',
                    description: 'Path to the repository',
                    control: 'text',
                    optional: false,
                },
                {
                    name: 'decision',
                    label: 'Decision to record / question to decide',
                    description: 'The decision to record (or the question to decide and record)',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'target_paths',
                    label: 'Relevant code/requirements (optional)',
                    description: 'Optional pointers to the relevant code/requirements/spec to ground the ADR',
                    control: 'text',
                    optional: true,
                },
            ],
            examples: {
                decision: [
                    'Adopt idempotency keys on payment write endpoints.',
                    'Should we split the billing module into its own service?',
                ],
                target_paths: ['src/payments/, docs/requirements/'],
            },
            keywords: ['agent', 'repository', 'ADR', 'architecture decision', 'context-aware', 'Nygard', 'A07'],
            executionContext: 'agent',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A07-architecture',
            relatedPromptIds: ['LP-A07-tradeoff', 'LP-A07-rfc'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
