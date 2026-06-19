# Prompt ID
USR-C01-idea-scamper

# Domain / Category
C — Thinking & Productivity / C01 Ideation

# Description
Single-shot prompt that applies the SCAMPER technique to improve an existing product, process, or feature.

# Prompt
Apply the SCAMPER technique to generate improvement ideas for the existing thing below. Run each prompt and produce 1–3 ideas per letter (do not skip letters that feel inapplicable — those often yield surprises). Defer evaluation.

SCAMPER:
- **S**ubstitute — replace a part/material/step.
- **C**ombine — merge with something else.
- **A**dapt — borrow an idea from elsewhere.
- **M**odify / Magnify — change scale, form, or attribute.
- **P**ut to other uses — new use or audience.
- **E**liminate — remove a part/step.
- **R**everse / Rearrange — invert order or roles.

Target (existing product/process/feature):
```
{{target}}
```

Output: ideas grouped under each SCAMPER letter, no evaluation.

# Parameters
- target
  - Description: The existing product, process, or feature to improve.

# Example Values
target:
- "Our CI/CD pipeline."
- "The onboarding email sequence."

# Notes
- Recommended system prompt: `SYS-C01-ideation`.
- Constraints: 1 param; improve existing things (not blank-sheet invention); defer evaluation.
- Related: `USR-C01-idea-generate`, `USR-C02-decide-prioritize` (rank the ideas).

# Keywords
SCAMPER, improve, ideation, substitute combine adapt, technique, C01
