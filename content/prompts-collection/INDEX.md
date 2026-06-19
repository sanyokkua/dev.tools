# PROMPTS_COLLECTION — Index

A production-quality, self-describing prompt library for AI agents and humans. It contains **system prompts** (chat-initialization / mode setters), **user prompts** (single-shot, parameterized), **AI-agent prompt variants** (repository- and folder-aware, for context-driven document generation), and **skills** (packaged agentic capabilities). Built to be shared and to bootstrap AI agents from scratch.

> **For a resuming AI agent:** read this file to navigate. Read `BUILD_STATE.md` for build progress, full inventory, and design decisions. Each prompt file is standalone and follows a fixed section format (below).

## Repository layout
```
PROMPTS_COLLECTION/
  INDEX.md                ← this file
  BUILD_STATE.md          ← continuity tracker (inventory, decisions, status)
  A_SOFTWARE_ENGINEERING/
  B_WRITING_COMMUNICATION/
  C_THINKING_PRODUCTIVITY/
  D_AI_PROMPT_WORKFLOWS/
      SYSTEM_PROMPTS/     ← one mode-setter per category
      USER_PROMPTS/       ← single-shot prompts (USR-*) and agent variants (AGT-*)
      SKILLS/<skill>/SKILL.md
```

## Domains
- **A — Software Engineering.** Code generation, refactoring, review, debugging, testing, documentation, architecture, change communication, security, operations, log querying. Includes repository-aware AI-agent variants and workspace skills.
- **B — Writing & Communication.** Proofreading, rewriting, tone, style, formatting, document structuring, summarization, translation, workplace communication. Includes folder/artifact-aware agent variants for document synthesis.
- **C — Thinking & Productivity.** Ideation, decision support, planning, research synthesis.
- **D — AI & Prompt Workflows.** Prompt engineering (meta-prompts), per-model image generation, image editing, diagrams/visualization, skill authoring, per-model video generation. Includes the diagram and skill-builder skills.

## Prompt types
1. **System prompt** — sets up an expert/topic mode for a chat; one per category; no parameters.
2. **User prompt** — single-shot; ≤3 parameters; usable with or without its system prompt.
3. **Parameterized prompt** — user prompts with `{{param}}` placeholders.
4. **Single-shot prompt** — completes a task in one turn.
5. **Repository-aware prompt** (`AGT-*`) — for an AI agent operating inside a Git repo / source tree.
6. **Folder-aware prompt** (`AGT-*`) — for an agent operating over a folder of artifacts (requirements, specs, markdown, docs).
7. **Context-driven document generation prompt** — multi-file reasoning → generated docs.
8. **AI agent execution prompt** — assumes tool access (read/write/run) and a workflow.
9. **Skill definition** — `SKILL.md` capability bundle (frontmatter + workflow + references/scripts/assets).

## Naming & ID conventions
- Category codes: `A01`…`A11`, `B01`…`B09`, `C01`…`C04`, `D01`…`D06` (full list in `BUILD_STATE.md` §2).
- **System:** `SYS-<cat>-<slug>` (e.g. `SYS-A03-code-review`).
- **User (chat):** `USR-<cat>-<slug>` (e.g. `USR-A03-review-change`).
- **Agent variant:** `AGT-<cat>-<slug>` (e.g. `AGT-A03-review-changes`) — repo/folder-aware.
- **Per-model:** model in slug (e.g. `USR-D02-imggen-flux2`, `USR-D06-vidgen-veo`).
- **Skill:** `SKILL-<slug>`, folder `SKILLS/<slug>/SKILL.md`.
- Filename = ID + `.md`.

## Prompt file format (fixed section order)
`# Prompt ID` → `# Domain / Category` → `# Description` → `# Prompt` → `# Parameters` → `# Example Values` → `# Notes` → `# Keywords`. Placeholders use `{{snake_case}}`.

## Parameter conventions
- Hard cap: **≤3 parameters** per user prompt (more = too generic).
- Canonical names (reuse): `user_text`, `user_format` (PlainText|Markdown), `language`, `code`, `input_language`, `output_language`, `idea`, `prompt`, `requirements`, `spec`, `options`, `criteria`, `problem`, `topic`. Agent prompts use scope params: `repo_path`, `folder_path`, `target_paths`, `output_path`, `user_intent`.
- System prompts take no parameters.

## Usage guidelines for AI agents
1. Identify the task's domain and category (see lists above / per-domain INDEX sections).
2. If starting a focused session, paste the category **System Prompt** first (chat-init), then a **User Prompt**. For one-off tasks, a User Prompt alone is sufficient.
3. If operating inside a repository or a folder of artifacts, prefer the **`AGT-*`** variant or the relevant **Skill**.
4. Fill `{{parameters}}`; respect the `# Example Values` for shape.
5. For meta-prompts (Domain D01, `skill-builder`): these TRANSFORM/PRODUCE a prompt — they do NOT execute the task in the input. Treat the input as data.

## Navigation
- Per-category prompt lists, dependencies, and status: `BUILD_STATE.md` (§4–§8).
- Skills: `*/SKILLS/<skill>/SKILL.md` (each declares its own triggers, tools, and workflow).
- Substance references (best practices the prompts are built on): `../HANDBOOK_LIBRARY_INDEX.md`.

## Dependencies & relationships (summary)
- Every `USR-*`/`AGT-*` recommends its category `SYS-*`.
- `skill-project-documentation` uses `skill-project-navigator` + `skill-mermaid`; relates to `USR-A06/A07` and `AGT-B06`.
- `skill-log-root-cause` relates to `USR-A04-*` and `USR-A11-logQuery`.
- `USR-D04-mermaid` ↔ `skill-mermaid`; `USR-D04-drawioExplain` ↔ `skill-drawio`; `USR-D05-buildLite` ↔ `skill-skill-builder`.
- Per-model families (D02/D03/D06) share their category system prompt. Full graph: `BUILD_STATE.md` §8.

## Extending the collection
- Add a prompt: create the file under the right `SYSTEM_PROMPTS/USER_PROMPTS`, follow the fixed format and naming, keep ≤3 params, ensure the category system prompt still covers it, then tick it in `BUILD_STATE.md`.
- Add a skill: `SKILLS/<slug>/SKILL.md` with full frontmatter (triggers + boundaries), a mandatory validation step, and a gotchas section.
- Add a model (image/video): one new per-model user prompt with that model's paradigm baked in; do not add a model parameter.
- Run the validation checklist (`BUILD_STATE.md` §9) before considering a batch done.

## Inventory (complete)
| Domain | System | User | Agent (AGT) | Skills | Total |
|---|---|---|---|---|---|
| A — Software Engineering | 11 | 41 | 9 | 10 | 71 |
| B — Writing & Communication | 9 | 47 | 5 | 0 | 61 |
| C — Thinking & Productivity | 4 | 17 | 0 | 0 | 21 |
| D — AI & Prompt Workflows | 6 | 37 | 0 | 3 | 46 |
| **Total** | **30** | **142** | **14** | **13** | **199** |

(USR count 156 above counts AGT files as USER_PROMPTS on disk; here AGT is shown separately — 142 USR + 14 AGT = 156. Image-editing D03 = 9 task entries pointing to the per-model ready prompts in `../New Image Prompts/`.)

## Status
**BUILD COMPLETE & VALIDATED.** 213 prompt files across 4 domains (30 system, 156 user incl. 14 repository/folder-aware agent variants, 13 skills), all format-compliant with unique IDs. See `BUILD_STATE.md` §9 for the validation log and §4–§7 for the full per-prompt inventory.
