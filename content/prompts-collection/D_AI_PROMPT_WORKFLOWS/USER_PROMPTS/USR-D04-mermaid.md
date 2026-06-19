# Prompt ID
USR-D04-mermaid

# Domain / Category
D — AI & Prompt Workflows / D04 Diagrams & Visualization

# Description
Single-shot prompt that generates a syntactically valid, render-ready Mermaid diagram from a description.

# Prompt
Create a Mermaid diagram for the description below. Choose the most appropriate diagram type (flowchart, sequence, class, state, ER, C4, etc.); if ambiguous, use a flowchart. {{diagramType}}

Description:
```
{{description}}
```

Follow Mermaid syntax rules so it renders on the first try:
- Node IDs: alphanumeric/underscore, start with a letter, not reserved words (`end`, `class`, `state`, etc.).
- Quote labels containing spaces/special characters; HTML-entity-encode characters that conflict with syntax (`"(){}[]<>|#`).
- Declare flowchart direction (TD/LR); match every `subgraph` with `end`; use valid edge syntax; no inline `%%` comments; no trailing semicolons.
Self-validate against these before output.

Output: ONLY a fenced ```mermaid code block.

# Parameters
- description
  - Description: What the diagram should depict (entities, flow, relationships).
- diagramType
  - Description: Optional — force a specific type (e.g., "use a sequence diagram"); blank = auto-select.

# Example Values
description:
- "the login flow: user → app → auth service → database, with a failure path"
- "order, customer, product tables and their relationships"

diagramType:
- "use a sequence diagram"
- (blank)

# Notes
- Recommended system prompt: `SYS-D04-diagrams-visualization`.
- Constraints: ≤2 params; valid render-ready syntax + self-validation.
- Related: agentic `SKILL-mermaid` (creates + validates + embeds in repo docs); `USR-D04-drawioExplain`.

# Keywords
mermaid, diagram, flowchart, sequence, ER, C4, render, D04
