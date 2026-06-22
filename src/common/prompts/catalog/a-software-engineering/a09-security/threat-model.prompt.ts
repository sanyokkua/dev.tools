import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A09-threat-model',
    categoryCode: 'A09',
    title: 'Build a Lightweight Threat Model',
    subtitle: 'Assets, entry points, STRIDE threats, and mitigations for a feature',
    description: 'Assets, entry points, STRIDE threats, and mitigations for a feature',
    variantAxes: [],
    defaultVariantId: 'USR-A09-sec-threatModel',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A09-sec-threatModel',
            kind: 'user',
            categoryCode: 'A09',
            title: 'Build a Lightweight Threat Model',
            description: 'Build a Lightweight Threat Model',
            template: `You are an application security analyst. Produce a lightweight threat model for the feature/system described below.

Subject:
\`\`\`
{{description}}
\`\`\`

Cover:
1. **Assets** — what is worth protecting (data, funds, availability, trust).
2. **Entry points / trust boundaries** — where untrusted input or actors meet the system.
3. **Threats** — organized by STRIDE: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege. For each applicable category, the realistic attack and impact.
4. **Mitigations** — concrete controls for the high-priority threats.
5. **Assumptions & out-of-scope** — what you assumed and what isn't covered.

Rules: be defensive; prioritize by realistic risk (likelihood × impact); do not produce attack tooling. If details are missing, state assumptions.

Output contract: a structured threat model (the sections above), with threats ranked by priority.

Worked example —
Input: "A public file-upload + sharing feature storing user files in S3."
Expected (excerpt): Assets — user files, the S3 bucket, share links. Entry points — the upload endpoint, the public share URL. Threats (STRIDE): Tampering — "malicious file (malware/SVG-XSS) served to other users" → mitigate by content sniffing + Content-Disposition + serving from a sandboxed domain; Information disclosure — "guessable share URLs leak files" → use unguessable tokens + expiry; Denial of service — "oversized/zip-bomb uploads" → size limits + scanning. Out-of-scope: the S3 account's IAM posture.
`,
            parameters: [
                {
                    name: 'description',
                    label: 'Feature / system to model',
                    description: 'The feature/system to model — what it does, actors, data, and exposure',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                description: [
                    'A public file-upload + sharing feature storing user files in S3.',
                    'An internal admin API that can refund payments.',
                ],
            },
            keywords: ['threat model', 'STRIDE', 'assets', 'trust boundary', 'mitigations', 'risk', 'A09'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A09-security',
            relatedPromptIds: ['LP-A09-review', 'LP-A07-review'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
