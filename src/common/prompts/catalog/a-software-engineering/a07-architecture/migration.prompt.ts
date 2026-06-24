import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A07-migration',
    categoryCode: 'A07',
    title: 'Plan a Migration',
    subtitle: 'A phased, risk-aware migration roadmap with rollback',
    description: 'A phased, risk-aware migration roadmap with rollback',
    variantAxes: [],
    defaultVariantId: 'USR-A07-arch-migration',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A07-arch-migration',
            kind: 'user',
            categoryCode: 'A07',
            title: 'Plan a Migration',
            description: 'Plan a Migration',
            template: `You are a migration consultant. Produce a phased, risk-aware migration plan from the source to the target below.

Source (current state):
\`\`\`
{{source}}
\`\`\`
Target (desired state):
\`\`\`
{{target}}
\`\`\`

Produce:
1. **Assessment** — what exists, dependencies, data volumes, risks, unknowns to validate first.
2. **Strategy** — overall approach (big-bang vs phased/strangler-fig; blue-green/canary where relevant) and why.
3. **Phases** — ordered steps: prepare → migrate data/code incrementally → cut over → validate; note what runs in parallel and rollback points.
4. **Data migration** — schema/format transformation, integrity checks, backfill, dual-write/dual-read if needed.
5. **Validation & rollback** — how to verify each phase and how to roll back safely.

Rules: prioritize data integrity and minimal downtime; call out backward-compatibility needs; if key facts (volumes, downtime tolerance) are missing, state assumptions.

Output contract: the migration roadmap (the sections above), with risks and rollback explicit.
`,
            parameters: [
                {
                    name: 'source',
                    label: 'Source (current state)',
                    description: 'Current technology/architecture/state',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'target',
                    label: 'Target (desired state)',
                    description: 'Target technology/architecture/state',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                source: ['Oracle 12c', 'Single monolith, Java 8'],
                target: ['PostgreSQL 16', 'Modular monolith, Java 21'],
            },
            keywords: ['migration', 'phased', 'strangler', 'data migration', 'rollback', 'cutover', 'A07'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A07-architecture',
            relatedPromptIds: ['LP-A07-design'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
