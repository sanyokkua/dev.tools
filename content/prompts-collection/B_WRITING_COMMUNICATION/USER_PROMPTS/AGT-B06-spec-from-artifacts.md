# Prompt ID
AGT-B06-spec-from-artifacts

# Domain / Category
B — Writing & Communication / B06 Document Structuring (Folder-aware agent variant)

# Description
Folder-aware AI-agent prompt that synthesizes a specification / requirements document from a folder of artifacts (notes, requirement docs, specs, markdown, code), with cross-reference validation and gaps flagged.

# Prompt
You are a technical writer working as an autonomous agent over the folder at `{{folder_path}}`. Synthesize a specification / requirements document from the artifacts there.

Focus (optional — feature/area or specific files): {{target_paths}}

Workflow:
1. INVENTORY: list the relevant artifacts (requirement docs, specs, markdown notes, tickets, and supporting code) in scope. Read them.
2. EXTRACT requirements, constraints, and acceptance criteria from across the files. Attribute each item to its source file so it is traceable.
3. RECONCILE: cross-reference the sources — flag conflicts, duplicates, and gaps between artifacts (e.g., a requirement in one doc contradicted by code or another doc). Do NOT silently resolve a conflict; surface it.
4. SYNTHESIZE a single specification document: Overview · Requirements · Constraints · Acceptance Criteria · Open Questions/Conflicts. Derive everything strictly from the artifacts; mark missing-but-expected items as "TODO: confirm".
5. WRITE the spec to a sensible location (e.g., `docs/spec-<feature>.md`); confirm before overwriting.

Constraints: synthesize from sources only — invent no requirements; every requirement is traceable to a file; conflicts/gaps are reported, not hidden.

Output: the spec document (written to disk) plus a completion report — sources used, conflicts/gaps found, TODOs, output path. End with `SPEC_COMPLETE`.

# Parameters
- folder_path
  - Description: Path to the folder of artifacts to synthesize from.
- target_paths
  - Description: Optional focus (feature/area or specific files); blank = whole folder.
- output_path
  - Description: Optional output file path; default `docs/spec-<feature>.md`.

# Example Values
folder_path:
- ./docs/requirements
- ~/project

target_paths:
- "the checkout redesign notes + related code"
- (blank)

output_path:
- docs/spec-checkout.md
- (blank — default)

# Notes
- Recommended system prompt: `SYS-B06-document-structuring`.
- Constraints: multi-file synthesis; traceability; conflict/gap reporting; ≤3 params.
- Assumptions: read/write tools; artifacts are in the folder.
- Dependencies: chat twin `USR-B06-docstruct-spec`; relates to `SKILL-project-documentation`.
- Limitations: quality bounded by the artifacts present; conflicts are surfaced, not decided.

# Keywords
agent, folder, specification, requirements, synthesize, cross-reference, multi-file, B06
