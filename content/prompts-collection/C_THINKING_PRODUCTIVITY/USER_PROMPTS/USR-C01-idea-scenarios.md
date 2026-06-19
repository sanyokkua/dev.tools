# Prompt ID
USR-C01-idea-scenarios

# Domain / Category
C — Thinking & Productivity / C01 Ideation

# Description
Single-shot, parameterized prompt that enumerates scenarios for a feature/change — positive, negative, or edge — to explore how it behaves.

# Prompt
Enumerate {{scenarioType}} scenarios for the feature/change below. Explore broadly and concretely; do not evaluate or prioritize yet.

- If {{scenarioType}} = "positive": ways the feature succeeds and creates value (who benefits, when, how).
- If {{scenarioType}} = "negative": ways it fails, causes harm, is misused, or has unintended consequences.
- If {{scenarioType}} = "edge": unusual inputs, boundary conditions, rare states, and corner cases that stress the behavior.

Feature / change:
```
{{feature}}
```

Output: a grouped, concrete list of {{scenarioType}} scenarios, each phrased as "When …, then …". Mark the highest-impact ones.

# Parameters
- feature
  - Description: The feature or change to explore.
- scenarioType
  - Description: positive | negative | edge.

# Example Values
feature:
- "Allowing users to schedule posts for later."
- "Adding a bulk-delete button."

scenarioType:
- positive
- negative
- edge

# Notes
- Recommended system prompt: `SYS-C01-ideation`.
- Constraints: ≤2 params; explore (don't evaluate); concrete "when/then".
- Related: `USR-A05-test-edgeCases` (edge cases for testing), `USR-A09-sec-threatModel` (misuse).

# Keywords
scenarios, positive negative edge, explore, feature, ideation, C01
