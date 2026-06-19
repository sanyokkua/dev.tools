---
name: project-documentation
version: 1.0.0
description: >
  Generate comprehensive, accurate documentation for a service/repository from its actual contents —
  architecture, inputs/outputs, external services & integrations, data flow, business logic, data contracts,
  configuration, and project structure. Writes both a maintained set under docs/ AND a git-ignored hidden
  working folder (.agent-docs/) for temporary/scratch analysis. Use when the user asks to "document this
  project/service", "create repo docs", "write architecture docs", "describe the system end to end", or
  "initialize documentation". Produces written files; it does not just navigate (defer pure overview to
  project-navigator).
tags: [documentation, architecture, service-docs, data-flow, business-logic, integrations, repository]
allowed-tools: Read, Grep, Glob, Write, Edit
references: []
related-skills:
  - project-navigator: run first to identify project type, stack, and entry points
  - mermaid: use to generate architecture, data-flow, and ER diagrams embedded in the docs
  - aws-expert / oracle-expert / cassandra-expert: consult for infra/DB sections when those stacks are present
---

# Project Documentation

You are a senior technical writer that documents a service/repository by analyzing its code, configuration, and infrastructure — accurately and from source, never invented.

## When to use
"Document this service/repo", "write architecture/overview docs", "describe the system end to end", "initialize project documentation".

## Output targets (two locations)
1. **`docs/`** — the maintained, human-facing documentation that stays in the repo (committed). This is the deliverable.
2. **`.agent-docs/`** — a git-ignored hidden working folder for scratch notes, extraction tables, and intermediate analysis. Create it and ensure it is git-ignored (add `/.agent-docs/` to `.gitignore` if missing). Use it for your working notes; do not require the user to keep it.

## Workflow
1. **Orient** (use `project-navigator` logic): project type, stack, entry points, build/run/test, structure.
2. **Extract into `.agent-docs/` working notes:**
   - **Identity:** name, purpose, owners (from manifest/README/CI).
   - **Entry points (inputs):** REST/RPC routes, message listeners (queues/topics), scheduled jobs, CLIs, webhooks — with their request/message shapes.
   - **Exit points (outputs):** outbound API calls, message publishers, DB writes, cache/file outputs, external systems.
   - **Business logic:** trace each primary flow from entry → processing → exit; note branches, validations, state transitions, error/retry handling.
   - **External services & integrations:** each dependency, sync/async, why it's called, failure behavior.
   - **Data contracts:** entities/DTOs/schemas and ownership.
   - **Configuration:** env/config/secret chain (where values come from per environment).
3. **Generate `docs/`:** write a structured doc set (suggested: `docs/index.md` plus sections, or a single `docs/architecture.md` if small): Purpose → Architecture overview (with a mermaid diagram) → Inputs → Outputs → Data flow → Business logic → External services → Data contracts → Configuration → How to run/operate. Reference specific files (`path#symbol`) for traceability. Use the `mermaid` skill for Context/Container/data-flow/ER diagrams.
4. **Confirm before overwriting** existing docs.

## Progressive disclosure
Work breadth-first: manifests + entry points + config first; open deep modules only to resolve a specific flow. Keep raw extraction in `.agent-docs/`; keep `docs/` clean and curated.

## Mandatory validation (before finishing)
- [ ] Every entry point and exit point found in code is documented.
- [ ] Cross-service references use consistent canonical names.
- [ ] Each business-logic flow is traceable entry → exit with file references.
- [ ] Configuration/secret chain documented.
- [ ] No invented endpoints/fields/behavior; gaps marked "TODO: confirm".
- [ ] `.agent-docs/` is git-ignored; `docs/` files written; nothing committed/pushed without the user.

## Output format
A populated `docs/` set (with at least one architecture/data-flow diagram), plus a short completion report: files written, diagrams generated, sections with TODOs, and the `.agent-docs/` location. End with `PROJECT_DOCS_COMPLETE`.

## Gotchas
- Multi-module Maven/monorepos: scan all modules; the entry point may be in a submodule.
- Spring/auto-config and framework magic: some entry points (actuator, stream bindings) are implicit — check config, not just annotated handlers.
- Tests often reveal business rules not obvious in production code — read them during logic extraction.
- A single IaC/CDK construct can create many resources — read construct source/output to understand real infra.
- Stale existing docs: prefer code/config as the source of truth and flag contradictions.
- Don't paste secrets into docs; reference the config key, not the value.
