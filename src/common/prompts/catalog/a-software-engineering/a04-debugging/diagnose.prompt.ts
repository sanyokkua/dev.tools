import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A04-diagnose',
    categoryCode: 'A04',
    title: 'Diagnose a Defect',
    subtitle: 'Root-cause a bug and propose a minimal fix — chat + repository-aware agent twin',
    description: 'Root-cause a bug and propose a minimal fix — chat + repository-aware agent twin',
    variantAxes: ['mode'],
    defaultVariantId: 'USR-A04-debug-diagnose',
    modeClass: 'dual',
    variants: [
        {
            id: 'USR-A04-debug-diagnose',
            kind: 'user',
            categoryCode: 'A04',
            title: 'Diagnose a Defect',
            description: 'Diagnose a Defect',
            template: `You are a debugging specialist. Diagnose the defect using the information below, following the scientific method.

Error / symptom:
\`\`\`
{{error}}
\`\`\`

Relevant code & context (language, framework, environment, reproduction):
\`\`\`
{{context}}
\`\`\`

Rules:
1. Identify the most likely root cause from the evidence; if multiple are plausible, rank them and state how to distinguish them.
2. Propose the smallest fix that addresses the root cause (not the symptom).
3. Provide a regression test that would FAIL before the fix and PASS after.
4. Do not present a guess as certainty; label confidence (high/medium/low). If a critical piece (e.g., full stack trace or reproduction) is missing and blocks diagnosis, state exactly what you need.
5. Redact any secrets or Personally Identifiable Information (PII) seen.

Output contract: **Issue** · **Most likely cause** (with evidence + confidence) · **Fix** (concrete change) · **Regression test** · **Verification steps**.
`,
            parameters: [
                {
                    name: 'error',
                    label: 'Error / symptom',
                    description: 'The error message, stack trace, or described symptom',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'context',
                    label: 'Relevant code & context',
                    description: 'Relevant code plus language/framework/environment and reproduction steps if known',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                error: [
                    "TypeError: cannot read properties of undefined (reading 'id')",
                    'Intermittent 500s under load; no stack trace',
                ],
                context: ['Node 20 / Express handler; <code>; happens only when query param is absent'],
            },
            keywords: ['debug', 'diagnose', 'root cause', 'error', 'stack trace', 'regression test', 'A04'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A04-debugging',
            relatedPromptIds: ['LP-A04-hypotheses'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'AGT-A04-diagnose',
            kind: 'agent',
            categoryCode: 'A04',
            title: 'Agent: Diagnose a Defect',
            description: 'Diagnose a Defect',
            template: `You are a debugging specialist working as an autonomous agent INSIDE the repository at \`{{repo_path}}\`. Find the root cause of the problem below by tracing the actual code path. By default, INVESTIGATE ONLY — do not modify files unless explicitly asked ({{user_intent}}).

Problem (error / symptom / failing case):
\`\`\`
{{problem}}
\`\`\`

Workflow (scientific method across the repo):
1. Reproduce mentally from the evidence: traverse the repo, locate the entry point, and trace the request/data flow to where it fails. Read the real code — do not guess. Cite real file:line references.
2. Form 2–3 ranked hypotheses for the root cause; gather evidence from the code, tests, and any logs to confirm/refute each.
3. Identify the precise root cause with file:line references and explain the mechanism.
4. Propose the smallest fix that addresses the root cause (not the symptom), and a regression test that would catch it. If asked to fix, apply the minimal change and run the tests; otherwise leave code unchanged.

Constraints: cite concrete files/functions/lines; one variable at a time in reasoning; don't present a guess as certainty (label confidence); redact secrets seen in code/logs; minimal-diff if fixing.

Output: **Root cause** (with file:line + mechanism + confidence) · **Code path** traced · **Smallest fix** (proposed or applied) · **Regression test** · **Verification**. End with \`DIAGNOSIS_COMPLETE\`.
`,
            parameters: [
                {
                    name: 'repo_path',
                    label: 'Repository path',
                    description: 'Path to the repository (or folder of repos) to investigate',
                    control: 'text',
                    optional: false,
                },
                {
                    name: 'problem',
                    label: 'Problem (error / symptom / failing case)',
                    description: 'The error, symptom, or failing scenario',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'user_intent',
                    label: 'Mode',
                    description: 'Optional — "diagnose only" (default) or "diagnose and fix"',
                    control: 'text',
                    optional: true,
                },
            ],
            examples: {
                problem: [
                    `Refund events without a \`reason\` field end up in the dead-letter queue (DLQ).`,
                    'Intermittent double-charge on checkout.',
                ],
                user_intent: ['diagnose only', 'diagnose and fix'],
            },
            keywords: ['agent', 'repository', 'debug', 'root cause', 'trace', 'code path', 'A04'],
            executionContext: 'agent',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A04-debugging',
            relatedPromptIds: ['LP-A04-hypotheses'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
