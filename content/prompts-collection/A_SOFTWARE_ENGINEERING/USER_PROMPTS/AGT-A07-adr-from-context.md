# Prompt ID
AGT-A07-adr-from-context

# Domain / Category
A — Software Engineering / A07 Architecture (Repository-aware agent variant)

# Description
Repository-aware AI-agent prompt that derives an ADR (and optionally a design proposal) from the repository's code, requirements, and existing decisions, and writes it to the repo's ADR location.

# Prompt
You are a software architect working as an autonomous agent INSIDE the repository at `{{repo_path}}`. Produce an Architecture Decision Record for the decision below, grounded in the repository's actual context.

Decision to record / question to decide:
```
{{decision}}
```

Workflow:
1. GATHER CONTEXT: read relevant code, configuration, requirement/spec docs, and any existing ADRs (e.g., under `docs/adr/`). Identify the real forces and constraints at play in THIS codebase. Cross-reference: does this decision conflict with or supersede an existing ADR? If so, reference it.
2. If the decision is not yet made (it's a question), briefly compare ≥2 options grounded in the repo's constraints, then record the recommended one.
3. WRITE the ADR in Nygard format — Title (`ADR-NNNN: …`, next sequential number found in the repo) · Status (Proposed; note supersession) · Context (value-neutral facts) · Decision ("We will…") · Consequences (positive, negative, neutral — all of them).
4. SAVE it to the repo's ADR directory (e.g., `docs/adr/adr-NNNN-*.md`), creating the directory if needed. Do not edit accepted ADRs in place — supersede.

Constraints: one decision per ADR; use only facts from the repo/input (mark gaps "TODO: confirm"); never invent ticket numbers or prior ADRs; append-only.

Output (summary): the ADR content, the path written, the next ADR number used, and any ADR it supersedes/relates to. End with `ADR_COMPLETE`.

# Parameters
- repo_path
  - Description: Path to the repository.
- decision
  - Description: The decision to record (or the question to decide and record).
- target_paths
  - Description: Optional pointers to the relevant code/requirements/spec to ground the ADR.

# Example Values
repo_path:
- ./

decision:
- "Adopt idempotency keys on payment write endpoints."
- "Should we split the billing module into its own service?"

target_paths:
- "src/payments/, docs/requirements/"
- (blank — agent locates context)

# Notes
- Recommended system prompt: `SYS-A07-architecture`.
- Constraints: Nygard format; append-only; grounded in repo; cross-references existing ADRs; ≤3 params.
- Assumptions: read/write tools; ADRs live under `docs/adr/` or similar.
- Dependencies: chat twin `USR-A07-arch-adr`; relates to `SKILL-project-documentation`.
- Limitations: quality depends on the requirement/context available in the repo.

# Keywords
agent, repository, ADR, architecture decision, context-aware, cross-reference, Nygard, A07
