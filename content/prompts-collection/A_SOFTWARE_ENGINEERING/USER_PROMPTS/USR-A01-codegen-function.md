# Prompt ID
USR-A01-codegen-function

# Domain / Category
A — Software Engineering / A01 Code Generation

# Description
Single-shot prompt that generates one well-structured function/method in a given language from a plain-language requirement.

# Prompt
You are an experienced {{language}} developer. Generate a single, well-structured {{language}} function that fulfills the requirement below.

Requirement:
```
{{requirements}}
```

Rules:
- Use idiomatic {{language}}, clear intent-revealing names, and a single responsibility.
- Validate inputs and handle errors per {{language}} conventions.
- Do not invent libraries or APIs; prefer the standard library. If you reference a third-party package, name it and note it must be verified.
- If a detail is missing, choose the safest reasonable interpretation and state the assumption — do not stop to ask.

Output:
1. The function in a fenced ```{{language}} block.
2. One line stating its contract: inputs, return value, and error behavior.
3. Any assumptions made.

# Parameters
- language
  - Description: Target programming language (and version if relevant).
- requirements
  - Description: Plain-language description of what the function must do, including inputs/outputs if known.

# Example Values
language:
- Python 3.12
- TypeScript
- Go

requirements:
- "Parse an ISO-8601 date string and return the number of whole days until today; raise on invalid input."
- "Given a list of order line items, return the total price as a Money value."

# Notes
- Recommended system prompt: `SYS-A01-code-generation` (sets up the coding mode; this prompt also works standalone).
- Constraints: ≤2 parameters; no invented dependencies.
- Assumptions: output is a draft to be reviewed and tested.
- Related: `USR-A01-codegen-class`, `USR-A05-test-generate` (tests for the function), `AGT-A01-implement` (in-repo).

# Keywords
function, method, code generation, {{language}}, implement, clean code, A01
