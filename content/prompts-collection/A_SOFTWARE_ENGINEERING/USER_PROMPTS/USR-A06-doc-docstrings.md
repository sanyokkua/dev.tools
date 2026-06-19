# Prompt ID
USR-A06-doc-docstrings

# Domain / Category
A — Software Engineering / A06 Code Documentation

# Description
Single-shot prompt that adds idiomatic docstrings / API-reference comments to public members of a code snippet.

# Prompt
You are a documentation engineer. Add documentation comments to the public/exported members of the {{language}} code below, following {{language}}'s conventions (e.g., JSDoc/TSDoc, PyDoc, GoDoc, JavaDoc).

Code:
```
{{code}}
```

Rules:
- Document every public/exported function, class, method, and type: purpose, parameters, return value, errors/exceptions, and important invariants. Skip private/internal members.
- Describe what the code ACTUALLY does — do not invent behavior. Use active voice, concise and factual.
- Comments explain WHY where the reason is non-obvious; do not restate the code.
- Return the code with docs added, unchanged otherwise.

Output: the documented code in a fenced ```{{language}} block. Note any member whose behavior was unclear and needs author confirmation.

# Parameters
- language
  - Description: Programming language (determines doc style).
- code
  - Description: The code to document.

# Example Values
language:
- TypeScript
- Python 3.12
- Go

code:
- "<a module with several exported functions>"

# Notes
- Recommended system prompt: `SYS-A06-code-documentation`.
- Constraints: ≤2 params; public members only; document actual behavior.
- Related: `USR-A06-doc-apiReference`, `AGT-A06-document-code` (across a repo).

# Keywords
docstrings, API comments, JSDoc, PyDoc, GoDoc, JavaDoc, documentation, {{language}}, A06
