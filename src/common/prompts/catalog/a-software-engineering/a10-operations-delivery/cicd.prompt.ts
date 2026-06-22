import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A10-cicd',
    categoryCode: 'A10',
    title: 'Design a CI/CD Pipeline',
    subtitle: 'A staged Continuous Integration / Continuous Delivery pipeline for a platform',
    description: 'A staged Continuous Integration / Continuous Delivery pipeline for a platform',
    variantAxes: [],
    defaultVariantId: 'USR-A10-ops-cicd',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A10-ops-cicd',
            kind: 'user',
            categoryCode: 'A10',
            title: 'Design a CI/CD Pipeline',
            description: 'Design a CI/CD Pipeline',
            template: `You are a DevOps engineer. Design a Continuous Integration / Continuous Delivery (CI/CD) pipeline for the {{platform}} platform and the deployment targets below.

Deployment targets & context:
\`\`\`
{{targets}}
\`\`\`

Design the pipeline with explicit stages: build → test → security scan (Static Application Security Testing (SAST) / Software Composition Analysis (SCA)) → package → deploy → rollback. For each stage, state what runs and the quality gate. Include:
1. Secret handling via a secrets store (never plaintext) and least-privilege credentials.
2. Immutable artifacts and environment promotion (dev → staging → prod).
3. A deployment strategy (blue/green or canary) where it fits, with health checks and automated rollback triggers.
4. Caching/parallelism to keep it fast.

Rules: use {{platform}}-correct concepts/syntax at a high level; do not hard-code secrets; call out cost drivers. State assumptions for anything unspecified.

Output contract: the pipeline plan (stages + gates), a config sketch for {{platform}}, and security/cost notes.

Worked example —
Input platform: "GitHub Actions"; targets: "A Dockerized service to ECS Fargate across dev/staging/prod."
Expected (excerpt): Stages — build & unit test (gate: tests pass) → SAST + \`npm audit\`/SCA (gate: no high severity) → build & push image to ECR (immutable, tagged by commit SHA) → deploy to dev → integration tests → promote to staging → canary to prod with CloudWatch alarm-based auto-rollback. Secrets via GitHub OIDC → AWS IAM role (no long-lived keys) + Secrets Manager. Config sketch: a \`workflow\` with jobs and \`environments\` for approvals. Cost note: Fargate per-task pricing; avoid idle staging tasks.
`,
            parameters: [
                {
                    name: 'platform',
                    label: 'CI/CD platform',
                    description: 'CI/CD platform (GitHub Actions, GitLab CI, Jenkins, CircleCI, Azure Pipelines)',
                    control: 'select',
                    optional: false,
                    valueSetId: 'cicd-platform',
                },
                {
                    name: 'targets',
                    label: 'Deployment targets & context',
                    description: 'What is being deployed and where (containers/VMs/serverless; cloud; environments)',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                platform: ['GitHub Actions', 'GitLab CI'],
                targets: [
                    'A Dockerized service to ECS Fargate across dev/staging/prod.',
                    'A static site to S3 + CloudFront.',
                ],
            },
            keywords: ['CI/CD', 'pipeline', 'build test deploy', 'rollback', 'canary', 'secrets', 'A10'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A10-operations-delivery',
            relatedPromptIds: ['LP-A10-observability'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
