# Prompt ID
USR-D04-drawioExplain

# Domain / Category
D — AI & Prompt Workflows / D04 Diagrams & Visualization

# Description
Single-shot prompt that interprets and explains a Draw.io (.drawio XML) diagram pasted as input — what it depicts, its components, flow, and any issues.

# Prompt
Interpret the Draw.io (`.drawio` XML) content below. Describe ONLY what is actually present — do not invent structure.

Draw.io XML:
```
{{drawioXml}}
```

Do the following:
1. Identify pages (`<diagram>` elements).
2. Inventory components: vertex cells (shapes) with their labels and shape types.
3. Map connections: edges, resolving source/target IDs to shape labels.
4. Identify containers/groups (cells that parent others).
5. Describe the flow: entry points → exit points, and the overall layout (LR/TB).
6. Flag issues: orphaned nodes (no connections), edges with missing source/target, overlaps, inconsistent styling.

If the diagram content is compressed/encoded (not raw `<mxGraphModel>` XML), say so and that it must be decoded first.

Output: a structured explanation (pages · components · connections · containers · flow · issues).

# Parameters
- drawioXml
  - Description: The .drawio file content (XML) to interpret.

# Example Values
drawioXml:
- "<mxfile>…<mxGraphModel>…</mxGraphModel></mxfile>"

# Notes
- Recommended system prompt: `SYS-D04-diagrams-visualization`.
- Constraints: 1 param; faithful interpretation; read-only (no generation).
- Related: agentic `SKILL-drawio` (reads .drawio files in a repo); `USR-D04-mermaid` (generate).

# Keywords
draw.io, drawio, diagram, interpret, explain, XML, review, D04
