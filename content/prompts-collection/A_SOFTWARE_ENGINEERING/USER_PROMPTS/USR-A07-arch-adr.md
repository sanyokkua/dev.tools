# Prompt ID
USR-A07-arch-adr

# Domain / Category
A — Software Engineering / A07 Architecture

# Description
Single-shot prompt that drafts an Architecture Decision Record (Nygard format) for a decision and its context.

# Prompt
You are a software architect. Draft an Architecture Decision Record (ADR) for the decision below, using the Nygard format.

Decision being made:
```
{{decision}}
```

Context (forces, constraints, alternatives considered):
```
{{context}}
```

Produce these sections:
- **Title** — `ADR-NNNN: <short noun phrase naming the decision>` (use a placeholder number).
- **Status** — Proposed (note if it supersedes another ADR).
- **Context** — the value-neutral facts and forces at play (what makes this decision necessary).
- **Decision** — active voice: "We will…".
- **Consequences** — ALL of them: positive, negative, and neutral. Do not hide the negatives.

Rules: capture ONE decision. Keep it short (1–2 pages). Use only facts from the input; mark gaps as "TODO: confirm". Remember ADRs are immutable once accepted — this records the decision as of now.

Output: ONLY the ADR in Markdown.

# Parameters
- decision
  - Description: The architectural decision to record.
- context
  - Description: The forces, constraints, and alternatives that shaped it.

# Example Values
decision:
- "Use idempotency keys on all payment write endpoints."
- "Adopt a modular monolith instead of microservices for v1."

context:
- "Mobile retries cause duplicate charges; at-least-once delivery; small team."

# Notes
- Recommended system prompt: `SYS-A07-architecture`.
- Constraints: ≤2 params; one decision; all consequences listed; append-only mindset.
- Related: `USR-A07-arch-tradeoff` (decide first), `AGT-A07-adr-from-context` (derive from repo).

# Keywords
ADR, architecture decision record, Nygard, context, decision, consequences, A07
