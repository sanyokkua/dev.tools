import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A07-quality-scenarios',
    categoryCode: 'A07',
    title: 'Write Quality-Attribute Scenarios',
    subtitle: 'Turn vague "-ilities" into measurable six-part scenarios',
    description: 'Turn vague "-ilities" into measurable six-part scenarios',
    variantAxes: [],
    defaultVariantId: 'USR-A07-arch-qualityScenarios',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A07-arch-qualityScenarios',
            kind: 'user',
            categoryCode: 'A07',
            title: 'Write Quality-Attribute Scenarios',
            description: 'Write Quality-Attribute Scenarios',
            template: `You are a software architect. Convert the vague non-functional requirements below into concrete, measurable quality-attribute scenarios.

Requirements / quality goals:
\`\`\`
{{requirements}}
\`\`\`

For each quality attribute (performance, availability, scalability, security, modifiability, etc.), write a six-part scenario:
- **Source** of stimulus · **Stimulus** · **Artifact** (what part of the system) · **Environment** (normal/peak/failure) · **Response** · **Response measure** (a number/threshold).

Rules: every scenario must have a measurable response measure (latency, %, throughput, recovery time). If a number is not given, propose a reasonable target and mark it as a proposed value to confirm. Separate true constraints from assumptions.

Output contract: a table or list of scenarios (one per priority quality attribute), with proposed measures clearly marked, and a short note on which are highest priority.

Worked example —
Input: "It should be fast and highly available."
Expected (excerpt):
- Performance — Source: a user · Stimulus: submits a search · Artifact: search API · Environment: peak load · Response: returns results · Measure: p95 ≤ 500ms [proposed].
- Availability — Source: a node failure · Stimulus: instance crashes · Artifact: the service · Environment: production · Response: traffic reroutes · Measure: ≥ 99.9% monthly uptime, recovery < 30s [proposed].
Highest priority: availability (revenue-impacting).
`,
            parameters: [
                {
                    name: 'requirements',
                    label: 'Requirements / quality goals',
                    description: 'The vague "-ilities" / quality goals to make measurable',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                requirements: ['It should be fast and highly available.', 'Must scale with growth and be secure.'],
            },
            keywords: ['quality attributes', 'non-functional requirements', 'scenarios', 'measurable', 'A07'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A07-architecture',
            relatedPromptIds: ['LP-A07-design', 'LP-A07-tradeoff'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
