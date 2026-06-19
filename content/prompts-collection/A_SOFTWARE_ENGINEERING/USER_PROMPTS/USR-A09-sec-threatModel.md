# Prompt ID
USR-A09-sec-threatModel

# Domain / Category
A — Software Engineering / A09 Security

# Description
Single-shot prompt that produces a lightweight threat model for a feature or system, identifying assets, entry points, threats, and mitigations.

# Prompt
You are an application security analyst. Produce a lightweight threat model for the feature/system described below.

Subject:
```
{{description}}
```

Cover:
- **Assets** — what is worth protecting (data, funds, availability, trust).
- **Entry points / trust boundaries** — where untrusted input or actors meet the system.
- **Threats** — organized by STRIDE (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege) where applicable; for each, the realistic attack and impact.
- **Mitigations** — concrete controls for the high-priority threats.
- **Assumptions & out-of-scope** — what you assumed and what isn't covered.

Rules: be defensive; prioritize by realistic risk (likelihood × impact); do not produce attack tooling. If details are missing, state assumptions.

Output: a structured threat model (the sections above), with threats ranked by priority.

# Parameters
- description
  - Description: The feature/system to model — what it does, actors, data, and exposure.

# Example Values
description:
- "A public file-upload + sharing feature storing user files in S3."
- "An internal admin API that can refund payments."

# Notes
- Recommended system prompt: `SYS-A09-security`.
- Constraints: 1 param; STRIDE; risk-ranked; defensive only.
- Related: `USR-A09-sec-review` (code-level), `USR-A07-arch-review`.

# Keywords
threat model, STRIDE, assets, trust boundary, mitigations, risk, security, A09
