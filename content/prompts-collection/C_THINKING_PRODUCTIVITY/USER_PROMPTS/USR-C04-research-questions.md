# Prompt ID
USR-C04-research-questions

# Domain / Category
C — Thinking & Productivity / C04 Research & Synthesis

# Description
Single-shot prompt that generates a structured set of research sub-questions for a topic, organized by theme.

# Prompt
Generate a structured set of research questions for the topic below. Decompose it into specific, answerable sub-questions, grouped into coherent themes (aim for MECE: minimal overlap, broad coverage). Order questions within each theme from foundational to advanced. Do NOT answer them. Flag any that require primary data vs literature, and note the one or two questions most critical to resolve first.

Topic:
```
{{topic}}
```

Output: themed groups of sub-questions (foundational → advanced), a note on which need primary data, and the top priority question(s).

# Parameters
- topic
  - Description: The research topic to break into questions.

# Example Values
topic:
- "Adopting event-driven architecture for our platform."
- "Improving onboarding completion rates."

# Notes
- Recommended system prompt: `SYS-C04-research-synthesis`.
- Constraints: 1 param; questions only; themed/MECE.
- Related: `USR-C03-plan-researchPlan` (full plan), `USR-C04-research-synthesize`.

# Keywords
research questions, sub-questions, themes, MECE, decompose, C04
