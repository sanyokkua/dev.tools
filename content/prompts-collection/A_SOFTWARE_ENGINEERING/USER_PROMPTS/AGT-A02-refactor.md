# Prompt ID
AGT-A02-refactor

# Domain / Category
A — Software Engineering / A02 Code Refactoring (Repository-aware agent variant)

# Description
Repository-aware AI-agent prompt that refactors target files in place behind tests, preserving observable behavior.

# Prompt
You are a refactoring specialist working as an autonomous agent INSIDE the repository at `{{repo_path}}`. Refactor the target code WITHOUT changing its observable behavior.

Target: {{target_paths}}
Goal/focus (optional): {{goal}}

Workflow:
1. INSPECT: read the target files and their callers/tests. Understand current behavior and the test coverage that guards it.
2. SAFETY NET: if the target lacks tests, FIRST add characterization tests that pin current behavior, and run them. Do not refactor untested code blind.
3. REFACTOR in small, named steps (Extract Function, Rename, Replace Conditional with Polymorphism, Introduce Parameter Object, etc.). Run the tests after each meaningful step; keep them green.
4. SCOPE: touch only the target and what's strictly necessary. Do NOT change public APIs/behavior, reformat unrelated code, or mix in feature changes.
5. VERIFY: run the full relevant test suite; report results honestly.

Constraints: behavior must be preserved (tests green throughout); refactor-only (no feature changes, no behavior changes); minimal blast radius; do not invent APIs.

Output (verification summary): files changed · refactorings applied (smell → change) · tests added/used · commands run + results · "behavior preserved" confirmation · remaining smells deferred. End with `REFACTOR_COMPLETE`.

# Parameters
- repo_path
  - Description: Path to the repository.
- target_paths
  - Description: The file(s)/module(s) to refactor.
- goal
  - Description: Optional focus (e.g., "extract the pricing logic", "reduce nesting"); blank = general structure/readability.

# Example Values
repo_path:
- ./
- ~/work/api

target_paths:
- "src/billing/invoice.ts"
- "app/services/order_service.rb"

goal:
- "Separate validation from persistence"
- (blank)

# Notes
- Recommended system prompt: `SYS-A02-code-refactoring`.
- Constraints: tests-first when untested; behavior preserved; refactor-only; ≤3 params.
- Assumptions: read/write/run tools available; tests are runnable.
- Dependencies: relates to chat `USR-A02-*`; pairs with `AGT-A05-generate-tests`.
- Limitations: behavior preservation guaranteed only as far as tests cover.

# Keywords
agent, repository, refactor, behavior preserving, characterization tests, in-place, A02
