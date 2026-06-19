# Prompt ID
USR-A10-ops-cicd

# Domain / Category
A — Software Engineering / A10 Operations & Delivery

# Description
Single-shot prompt that designs a CI/CD pipeline for a given platform and deployment targets.

# Prompt
You are a DevOps engineer. Design a CI/CD pipeline for the {{platform}} platform and the deployment targets below.

Deployment targets & context:
```
{{targets}}
```

Design the pipeline with explicit stages: build → test → security scan (SAST/SCA) → package → deploy → rollback. For each stage, state what runs and the quality gate. Include:
- Secret handling via a secrets store (never plaintext) and least-privilege credentials.
- Immutable artifacts and environment promotion (dev → staging → prod).
- A deployment strategy (blue/green or canary) where it fits, with health checks and automated rollback triggers.
- Caching/parallelism to keep it fast.

Rules: use {{platform}}-correct concepts/syntax at a high level; do not hard-code secrets; call out cost drivers. State assumptions for anything unspecified.

Output: the pipeline plan (stages + gates), a config sketch for {{platform}}, and security/cost notes.

# Parameters
- platform
  - Description: CI/CD platform (e.g., GitHub Actions, GitLab CI, Jenkins, CircleCI).
- targets
  - Description: What is being deployed and where (containers/VMs/serverless; cloud; environments).

# Example Values
platform:
- GitHub Actions
- GitLab CI

targets:
- "A Dockerized service to ECS Fargate across dev/staging/prod."
- "A static site to S3 + CloudFront."

# Notes
- Recommended system prompt: `SYS-A10-operations-delivery`.
- Constraints: ≤2 params; secure secrets; rollback + gates; cost-aware.
- Related: `USR-A10-ops-observability`, `SKILL-config-scan`.

# Keywords
CI/CD, pipeline, build test deploy, rollback, canary, secrets, {{platform}}, A10
