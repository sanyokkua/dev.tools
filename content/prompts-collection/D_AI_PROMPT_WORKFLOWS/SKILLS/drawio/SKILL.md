---
name: drawio
version: 1.0.0
description: >
  Read, interpret, and review .drawio XML diagram files found in a repository — parse structure, identify
  components and connections, trace flow, and explain what a diagram depicts or what changed. Use when a
  .drawio file needs to be understood, a PR changes a .drawio file, or architecture/flow must be extracted
  from one. READ-ONLY: it does not generate or modify diagrams (use the mermaid skill to create diagrams).
tags: [drawio, diagrams, read-only, interpret, review, architecture, xml]
allowed-tools: Read, Grep, Glob
references: []
related-skills:
  - mermaid: to CREATE/regenerate diagrams (this skill only reads .drawio)
  - project-documentation: consumes diagram interpretations for docs
---

# Draw.io (Read-Only Skill)

You read and explain `.drawio` XML diagrams. You do not create or modify them.

## When to use
A `.drawio` file needs to be understood or reviewed; a PR changes a `.drawio`; or architecture/flow must be extracted from one for documentation.

## Workflow
1. **Locate & open** the `.drawio` file(s). Detect whether content is raw `<mxGraphModel>` XML or a compressed/encoded `<diagram>` string (if encoded, state it must be decoded first — you can interpret only what's readable).
2. **Identify pages** (`<diagram>` elements).
3. **Inventory components:** vertex cells (shapes) — record label (`value`) and type (from `style`: rounded rect, ellipse, rhombus, cylinder, swimlane, AWS/UML shapes, etc.).
4. **Map connections:** edge cells — resolve `source`/`target` IDs to shape labels; note edge labels (protocols).
5. **Identify containers/groups:** cells that parent others (`swimlane`, `group`, `container=1`).
6. **Describe the flow & layout:** entry → exit points; LR vs TB; color-coding conventions.
7. **Flag issues** (if reviewing): orphaned nodes, edges with missing source/target, overlapping shapes, inconsistent styling.

## Mandatory validation (before answering)
- [ ] Every described component/connection exists in the file (no invented structure).
- [ ] Source/target IDs resolved to real labels.
- [ ] Encoded-content case handled explicitly.
- [ ] No file modified.

## Output format
A structured interpretation: pages · components · connections · containers · flow · issues. End with `DRAWIO_READ_COMPLETE`.

## Gotchas
- `id="0"`/`id="1"` are root cells; user shapes start at `id="2"`.
- Children use `parent="<containerId>"`, with geometry relative to the parent.
- Compressed diagrams (deflate+base64) can't be read without decoding — say so rather than guessing.
- Multi-page files: each `<diagram>` is its own model/tree.
- Don't infer meaning from color alone; confirm against labels/structure.
