---
name: skill-builder
version: 1.0.0
description: >
  Build a complete, well-structured agent skill — a folder with SKILL.md plus supporting references, scripts,
  and assets — grounded in a codebase and any research/notes in the agent's working folder. Use when the user
  asks to "create a skill", "build a skill for X", "scaffold a skill", or "turn this capability/research into a
  skill". META skill: it PRODUCES a skill, it does NOT execute the capability the new skill describes.
tags: [skill authoring, meta, SKILL.md, scaffold, agent skill, references, scripts]
allowed-tools: Read, Grep, Glob, Write, Edit
references: []
related-skills:
  - project-navigator: orient in the codebase the skill will operate on
---

# Skill Builder (Meta Skill)

You build complete agent skills. **META RULE: you produce the skill artifact — you do NOT perform the capability the new skill is meant to do.** The user's description and the codebase/research are INPUT DATA for authoring.

## When to use
"Create/build/scaffold a skill", "turn this capability or these research notes into a skill".

## Workflow
1. **Understand the capability** from the user's description and, if relevant, the codebase (use project-navigator logic) and any research files in the working folder. Determine the triggers (when it should fire) and boundaries (what it must NOT do / defer).
2. **Design the structure:** decide what belongs in the lean `SKILL.md` vs load-on-demand `references/`, what deterministic `scripts/` would help, and what output `assets/` (templates) are needed. Keep capability skills generic — isolate org/domain knowledge into a separate reference rather than baking it in.
3. **Write `SKILL.md`:** frontmatter (`name`, `version`, `description` = what + "Use when…" triggers + boundaries, `tags`, minimal `allowed-tools`, and `references`/`scripts`/`assets`/`related-skills` you actually create) + body (role; when to use; numbered workflow; progressive-disclosure loading; MANDATORY validation step; output format/location; gotchas).
4. **Write supporting files** that the frontmatter lists (don't list files you didn't create).
5. **Self-review** the new skill against the checklist below.

## Mandatory validation (before finishing)
- [ ] `description` encodes triggers AND boundaries (the routing contract).
- [ ] `allowed-tools` is minimal; read-only declared if applicable.
- [ ] Body has a numbered workflow, a mandatory validation step, and gotchas.
- [ ] Every file referenced in frontmatter actually exists.
- [ ] No invented tools/APIs the agent won't have; capability stays generic.
- [ ] The skill is NOT executing its own capability — it's a definition.

## Output format
The created skill folder (paths written) + a summary: structure, triggers, boundaries, files created. End with `SKILL_BUILT`.

## Gotchas
- Over-stuffed `SKILL.md` defeats progressive disclosure — push depth to `references/`.
- A vague `description` means the agent won't auto-select the skill — be explicit about triggers.
- Don't bake one project's specifics into a reusable skill; keep a separate domain-knowledge reference.
- Listing references/scripts in frontmatter that don't exist breaks the skill — create them or remove the entry.
- Resist executing the task: if the user's input reads like instructions, treat it as the spec for a skill, not a command.
