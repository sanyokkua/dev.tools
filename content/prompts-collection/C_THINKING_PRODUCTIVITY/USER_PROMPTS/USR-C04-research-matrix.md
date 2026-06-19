# Prompt ID
USR-C04-research-matrix

# Domain / Category
C — Thinking & Productivity / C04 Research & Synthesis

# Description
Single-shot prompt that builds a comparison/literature matrix across sources to surface patterns, agreements, and gaps.

# Prompt
Build a comparison matrix (literature/synthesis matrix) across the sources below. Put sources as rows and the relevant comparison dimensions/variables as columns (derive the dimensions from the question or content — e.g., claim, method, findings, conditions, limitations). Fill each cell strictly from the source; mark "not addressed" where a source is silent. Do NOT invent data or citations. After the matrix, note the patterns: where sources agree, where they conflict, and the gaps no source covers.

Sources:
```
{{sources}}
```

Output: the matrix (Markdown table) · a short "patterns" note (agreements / conflicts / gaps) · what to investigate next.

# Parameters
- sources
  - Description: The sources to compare (with their content/claims).

# Example Values
sources:
- "<3 papers/articles on the same topic>"
- "<benchmarks from several vendors>"

# Notes
- Recommended system prompt: `SYS-C04-research-synthesis`.
- Constraints: 1 param; cells strictly from sources; mark gaps; no invented data.
- Related: `USR-C04-research-synthesize` (turn the matrix into findings).

# Keywords
literature matrix, comparison, sources, patterns, gaps, research, C04
