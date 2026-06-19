# Prompt ID
USR-A07-arch-migration

# Domain / Category
A — Software Engineering / A07 Architecture

# Description
Single-shot prompt that produces a phased, risk-aware migration plan from a source technology/state to a target.

# Prompt
You are a migration consultant. Produce a phased, risk-aware migration plan from the source to the target below.

Source (current state): {{source}}
Target (desired state): {{target}}

Produce:
- **Assessment** — what exists, dependencies, data volumes, risks, unknowns to validate first.
- **Strategy** — overall approach (big-bang vs phased/strangler; blue-green/canary where relevant) and why.
- **Phases** — ordered steps: prepare → migrate data/code incrementally → cut over → validate; note what runs in parallel and rollback points.
- **Data migration** — schema/format transformation, integrity checks, backfill, dual-write/dual-read if needed.
- **Validation & rollback** — how to verify each phase and how to roll back safely.

Rules: prioritize data integrity and minimal downtime; call out backward-compatibility needs; if key facts (volumes, downtime tolerance) are missing, state assumptions.

Output: the migration roadmap (the sections above), with risks and rollback explicit.

# Parameters
- source
  - Description: Current technology/architecture/state.
- target
  - Description: Target technology/architecture/state.

# Example Values
source:
- "Oracle 12c"
- "Single monolith, Java 8"

target:
- "PostgreSQL 16"
- "Modular monolith, Java 21"

# Notes
- Recommended system prompt: `SYS-A07-architecture`.
- Constraints: ≤2 params; data integrity + rollback emphasized.
- Related: `USR-A07-arch-design`, `SKILL-project-navigator` (assess current repo first).

# Keywords
migration, phased, strangler, data migration, rollback, cutover, architecture, A07
