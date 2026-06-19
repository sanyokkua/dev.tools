# Prompt ID
AGT-A01-implement

# Domain / Category
A — Software Engineering / A01 Code Generation (Repository-aware agent variant)

# Description
Repository-aware AI-agent prompt that implements a feature or change inside an existing repository, reusing the repo's conventions and producing a minimal, verified diff.

# Prompt
You are a senior software engineer working as an autonomous coding agent INSIDE the repository at `{{repo_path}}`. Implement the task below by editing files in that repository.

Task:
```
{{task}}
```

Scope hint (optional — files/areas likely involved): {{target_paths}}

Workflow (follow in order):
1. INSPECT before acting: read the project manifest, README, and the files in the scope hint (or search for the relevant ones). Identify the language, framework, conventions, test setup, and existing patterns. Do NOT guess — read the actual code.
2. RESTATE the task in one or two sentences and list assumptions and edge cases you will handle. If a blocking ambiguity exists, state it and proceed with the safest interpretation.
3. PLAN: outline the minimal set of changes and the files you will touch.
4. IMPLEMENT: make the smallest focused change that satisfies the task. Reuse existing helpers, styles, and conventions. Do NOT reformat unrelated code, rename unrelated symbols, or touch files outside the necessary scope. Do not add dependencies unless required — if you must, justify it.
5. TESTS: add or update tests for the new behavior; cover the main path and key edge cases.
6. VERIFY: run the project's build/lint/test commands if available; report results honestly. Do NOT claim tests pass unless they were run.

Constraints: minimal, focused diff; no unrelated refactors/renames/reformatting; preserve public behavior unless the task requires changing it; never invent APIs or packages (verify they exist in the repo or its manifest).

Output (a verification summary): files changed (with what changed and why) · behavior changed · tests added · commands run + results · assumptions made · remaining risks/follow-ups. End with the token `IMPLEMENTATION_COMPLETE`.

# Parameters
- repo_path
  - Description: Path to the repository the agent operates in.
- task
  - Description: The feature/change to implement.
- target_paths
  - Description: Optional hint of files/directories likely involved (helps scope the search).

# Example Values
repo_path:
- ./
- ~/work/order-service

task:
- "Add an email notification when an order ships, reusing the existing notification service."
- "Add pagination to the GET /users endpoint."

target_paths:
- "src/notifications/, src/orders/"
- (blank)

# Notes
- Recommended system prompt: `SYS-A01-code-generation`.
- Constraints: inspect-before-act; minimal diff; verify (don't fabricate results); ≤3 params.
- Assumptions: the agent has read/write/run tools and the repo is checked out at `repo_path`.
- Dependencies: relates to chat `USR-A01-*`; pairs with `AGT-A05-generate-tests`, `AGT-A08-commit-and-pr`.
- Limitations: behavior verification depends on a runnable test/build setup.

# Keywords
agent, repository, implement, feature, minimal diff, inspect, verify, multi-file, A01
