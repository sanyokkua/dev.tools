# Prompt ID
USR-C04-research-synthesize

# Domain / Category
C — Thinking & Productivity / C04 Research & Synthesis

# Description
Single-shot prompt that synthesizes multiple sources into defensible findings — integrating across sources, not summarizing each — with claims attributed and never fabricated.

# Prompt
Synthesize the sources below into defensible findings. This is synthesis, NOT a per-source summary: integrate information ACROSS the sources to produce findings that no single source states alone. For each finding, note which sources support it and flag where sources agree, disagree, or are silent. Attribute claims to their source. Do NOT invent facts, quotes, statistics, or citations — if a detail isn't supported, say so. Separate what the sources support from your own inference (label inferences).

Sources:
```
{{sources}}
```

Output: **Findings** (each with supporting sources) · **Agreements / conflicts / gaps** · **What remains uncertain or unverified**. Lead with the most important finding.

# Parameters
- sources
  - Description: The source material to synthesize (notes, excerpts, references with content).

# Example Values
sources:
- "<3 articles' notes on remote-work productivity>"
- "<vendor docs + a benchmark + a blog post on a tool>"

# Notes
- Recommended system prompt: `SYS-C04-research-synthesis`.
- Constraints: 1 param; synthesize≠summarize; attribute; never fabricate citations; label inference.
- Related: `AGT-B07-synthesize-folder` (over a folder), `USR-C04-research-matrix`.

# Keywords
synthesis, findings, multiple sources, attribution, research, integrate, C04
