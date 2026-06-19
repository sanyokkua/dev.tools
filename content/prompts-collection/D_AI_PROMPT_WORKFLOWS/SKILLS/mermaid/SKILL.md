---
name: mermaid
version: 1.0.0
description: >
  Create and self-validate Mermaid diagrams that render correctly on the first attempt, and embed them into
  documentation. Use when the user needs any diagram — flowchart, sequence, class, state, ER, C4 architecture,
  Gantt — or asks to visualize a flow, architecture, or data model, especially inside repo docs. Produces
  Mermaid code (and writes it into Markdown docs when asked).
tags: [mermaid, diagrams, flowchart, sequence, ER, c4, visualization, documentation]
allowed-tools: Read, Write, Edit
references: []
related-skills:
  - project-documentation: commonly invoked by it to produce architecture and data-flow diagrams
  - drawio: for interpreting existing .drawio diagrams (read-only)
---

# Mermaid (Skill)

You create Mermaid diagrams that render on the first try, and optionally embed them into Markdown docs. Every diagram MUST pass self-validation before output.

## When to use
The user needs a diagram (flowchart/sequence/class/state/ER/C4/etc.), wants to visualize a flow/architecture/data model, or wants a diagram added to repo documentation.

## Workflow
1. **Pick the type** from the user's intent (flow → flowchart; interactions/order → sequence; data model → ER; types → class; transitions → state; system at zoom levels → C4). Default to flowchart if ambiguous.
2. **Build** the diagram: declare type/direction; define nodes then edges; group with subgraphs; meaningful IDs; keep under ~25–30 nodes (split if larger).
3. **Apply syntax rules:** node IDs alphanumeric/underscore, start with a letter, never reserved words (`end`, `class`, `state`, …); quote labels with spaces/special chars; HTML-entity-encode conflicting chars (`"(){}[]<>|#`); match every `subgraph` with `end`; valid edge syntax; no inline `%%`; no trailing semicolons.
4. **Embed** (if asked): write the fenced ```mermaid block into the target Markdown doc with a heading and one-line caption.

## Mandatory validation (run before EVERY output)
- [ ] IDs valid, unique, not reserved words. [ ] Labels with special chars quoted + entity-encoded. [ ] Direction declared (flowchart). [ ] Every `subgraph` has `end`. [ ] Valid arrows/edge labels. [ ] No inline comments / trailing semicolons. [ ] Chosen type fits intent.

## Output format
A fenced ```mermaid code block (and, when embedding, the updated doc path). End with `MERMAID_COMPLETE`.

## Gotchas
- `end` as a bare ID closes a subgraph — use `endNode` and quote `["end"]` labels.
- `stateDiagram-v2` over `stateDiagram`; C4 needs Mermaid 9.2+; `block/xychart/sankey` are experimental and may not render on GitHub/GitLab.
- Keep labels under ~50 chars; use `<br/>` for wrapping.
- Hand-maintained large diagrams rot — prefer regenerating from source.
