# Prompt ID
USR-C04-research-sourceEval

# Domain / Category
C — Thinking & Productivity / C04 Research & Synthesis

# Description
Single-shot prompt that evaluates the credibility of a source using lateral-reading logic, classifying type and flagging bias.

# Prompt
Evaluate the credibility of the source below. Use a lateral-reading mindset: rather than trusting surface cues (looks professional, has citations), reason about what an informed reader would check — who is behind it, their expertise and incentives, whether other independent sources corroborate it, and how current it is.

Assess and report:
- **Type:** primary / secondary / tertiary, and what kind (e.g., vendor page, peer-reviewed, news, blog).
- **Authority:** who created it and their relevant expertise/standing.
- **Purpose / bias:** why it exists; commercial, advocacy, or other incentives.
- **Corroboration:** what to check elsewhere to confirm its key claims (lateral reading).
- **Currency:** how recent / whether it may be outdated.
- **Verdict:** how much weight to give it, and for what kinds of claims.

Source (description, URL info, or content):
```
{{source}}
```

Output: the assessment under those headings, ending with a credibility verdict and the specific lateral checks to run.

# Parameters
- source
  - Description: The source to evaluate (content, description, or reference details).

# Example Values
source:
- "A vendor white paper claiming their database is '#1 fastest'."
- "A 2019 blog post about a fast-moving framework's best practices."

# Notes
- Recommended system prompt: `SYS-C04-research-synthesis`.
- Constraints: 1 param; lateral reading over surface cues; recommend checks rather than asserting unverifiable facts.
- Related: `USR-C04-research-synthesize`, `USR-A09-sec-depCheck` (dependency provenance).

# Keywords
source evaluation, credibility, lateral reading, bias, primary secondary, research, C04
