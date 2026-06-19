# Prompt ID
USR-A06-doc-explainCode

# Domain / Category
A — Software Engineering / A06 Code Documentation

# Description
Single-shot prompt that explains what a code block does, for onboarding or understanding — its purpose, flow, and notable decisions.

# Prompt
You are a documentation engineer helping someone understand unfamiliar code. Explain the {{language}} code below clearly.

Code:
```
{{code}}
```

Cover:
- Purpose: what this code is for, in one or two sentences.
- Flow: how it works step by step (inputs → processing → outputs), at the right level of detail.
- Key decisions / non-obvious parts: why certain things are done this way, edge cases handled, dependencies used.
- Gotchas: anything surprising, risky, or easy to misuse.

Rules: explain only what the code shows; if intent is unclear, say so rather than guessing. Use plain language; avoid restating each line — focus on understanding.

Output: a clear explanation (prose + short structure), suitable for a developer new to this code.

# Parameters
- language
  - Description: Language of the code.
- code
  - Description: The code block to explain.

# Example Values
language:
- Python 3.12
- Java 21

code:
- "<a non-trivial algorithm or service method>"

# Notes
- Recommended system prompt: `SYS-A06-code-documentation`.
- Constraints: ≤2 params; explain actual behavior; no line-by-line restatement.
- Related: `USR-A06-doc-docstrings`, `SKILL-project-navigator` (whole-repo orientation).

# Keywords
explain code, onboarding, understand, walkthrough, flow, documentation, {{language}}, A06
