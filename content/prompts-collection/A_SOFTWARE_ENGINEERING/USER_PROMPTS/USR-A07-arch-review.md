# Prompt ID
USR-A07-arch-review

# Domain / Category
A — Software Engineering / A07 Architecture

# Description
Single-shot prompt that critiques a proposed design/architecture for risks, trade-offs, and gaps.

# Prompt
You are a software architect performing a design review. Critique the proposed design below — constructively and concretely.

Design:
```
{{design}}
```

Evaluate:
- Fit to requirements/quality attributes (does it actually meet the stated goals?).
- Hidden or understated trade-offs and risks (scaling, consistency, failure modes, operability, cost, security).
- Complexity vs. the problem (over- or under-engineered?).
- Missing concerns (observability, data migration, backward compatibility, rollback).
- Alternatives worth considering.

Rules: critique the design, not the author; ground each point in a reason; distinguish blocking risks from minor suggestions. If key context is missing to judge, say what you'd need.

Output: **Strengths** · **Risks & trade-offs (ranked)** · **Gaps/missing concerns** · **Alternatives to consider** · **Overall: ready / ready-with-changes / needs-rework**.

# Parameters
- design
  - Description: The proposed architecture/design to review (doc, diagram description, or RFC).

# Example Values
design:
- "<an RFC proposing microservices + event sourcing for a new product>"
- "<a diagram + notes for a serverless ingestion pipeline>"

# Notes
- Recommended system prompt: `SYS-A07-architecture`.
- Constraints: 1 param; ranked risks; blocking vs minor.
- Related: `USR-A07-arch-tradeoff`, `USR-A03-review-change` (code-level review).

# Keywords
design review, architecture, risks, trade-offs, critique, gaps, alternatives, A07
