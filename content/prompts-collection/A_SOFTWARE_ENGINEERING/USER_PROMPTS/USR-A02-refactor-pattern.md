# Prompt ID
USR-A02-refactor-pattern

# Domain / Category
A — Software Engineering / A02 Code Refactoring

# Description
Single-shot prompt that refactors code by applying an appropriate design pattern, preserving behavior.

# Prompt
You are a refactoring specialist. Refactor the {{language}} code below by applying a suitable design pattern, without changing observable behavior.

Code:
```
{{code}}
```

Pattern (optional — if blank, recommend one): {{pattern}}

Rules:
- If a pattern is named, apply it only if it genuinely fits; if it does not, say so and propose a better-fitting pattern with reasoning.
- If no pattern is given, recommend the most appropriate one for the code's problem (e.g., Strategy for varying behavior, Factory for creation, Observer for events) and justify it briefly.
- Preserve observable behavior; keep the public interface stable unless the pattern requires a documented change.
- Do not introduce a pattern where simpler code suffices (avoid pattern over-engineering).

Output:
1. The pattern chosen and why it fits.
2. The refactored code in a fenced block.
3. A "behavior preserved" note and any trade-offs the pattern introduces.

# Parameters
- language
  - Description: Programming language of the snippet.
- code
  - Description: The code to refactor.
- pattern
  - Description: Optional named design pattern to apply; blank = let the model recommend.

# Example Values
language:
- Java 21
- C#

code:
- "<a class with a large type-switch computing pay by employee type>"

pattern:
- Strategy
- (blank)

# Notes
- Recommended system prompt: `SYS-A02-code-refactoring`.
- Constraints: 3 params (pattern optional); avoid over-engineering; behavior preserved.
- Related: `USR-A02-refactor-improve` (no-pattern restructure).

# Keywords
design pattern, refactor, Strategy, Factory, Observer, behavior preserving, {{language}}, A02
