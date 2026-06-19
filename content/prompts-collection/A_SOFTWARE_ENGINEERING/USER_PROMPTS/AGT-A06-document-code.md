# Prompt ID
AGT-A06-document-code

# Domain / Category
A — Software Engineering / A06 Code Documentation (Repository-aware agent variant)

# Description
Repository-aware AI-agent prompt that generates accurate documentation (docstrings, module/API docs) from the repository's actual source, in the requested scope.

# Prompt
You are a documentation engineer working as an autonomous agent INSIDE the repository at `{{repo_path}}`. Generate documentation derived strictly from the actual source.

Scope: {{target_paths}}
What to produce: {{doc_kind}}  (e.g., docstrings in-place, a module README, API reference, an architecture/overview doc)

Workflow:
1. INSPECT the in-scope source (and its tests, which reveal intended behavior). Determine the language's documentation conventions.
2. For the requested `doc_kind`, generate documentation that reflects what the code ACTUALLY does — signatures, parameters, returns, errors, and the WHY behind non-obvious decisions. Use tests as the source of truth for examples; do not invent behavior or examples.
3. Apply the right Diátaxis mode for the artifact (reference vs how-to vs explanation) and keep modes unmixed.
4. WRITE the documentation to the appropriate location: docstrings in-place in the source files; standalone docs under `docs/` (or where the repo keeps docs), creating the file(s). Confirm before overwriting existing docs.

Constraints: factual (no invented APIs/behavior/examples); document public/exported members; mark anything ambiguous as "TODO: confirm"; minimal changes to source when adding docstrings (no logic changes).

Output (summary): files created/edited · what was documented · doc mode used · any TODOs needing author confirmation. End with `DOCS_COMPLETE`.

# Parameters
- repo_path
  - Description: Path to the repository.
- target_paths
  - Description: The files/modules/areas to document.
- doc_kind
  - Description: The documentation artifact to produce (docstrings | module README | API reference | overview/explanation).

# Example Values
repo_path:
- ./

target_paths:
- "src/api/"
- "pkg/scheduler/"

doc_kind:
- docstrings
- API reference

# Notes
- Recommended system prompt: `SYS-A06-code-documentation`.
- Constraints: factual; tests as example source; one Diátaxis mode per doc; ≤3 params.
- Assumptions: read/write tools; repo has a docs location or `docs/` can be created.
- Dependencies: chat twins `USR-A06-*`; whole-repo version `SKILL-project-documentation`.
- Limitations: reflects current source; regenerate after code changes.

# Keywords
agent, repository, documentation, docstrings, API docs, Diátaxis, from source, A06
