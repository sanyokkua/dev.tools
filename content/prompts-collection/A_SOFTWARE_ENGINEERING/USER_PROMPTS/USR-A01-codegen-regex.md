# Prompt ID
USR-A01-codegen-regex

# Domain / Category
A — Software Engineering / A01 Code Generation

# Description
Single-shot prompt that builds and explains a regular expression for a stated matching task, in a specified regex flavor.

# Prompt
You are a regular-expression expert. Build a regular expression for the matching task below, in the {{flavor}} flavor.

Matching task:
```
{{description}}
```

Rules:
- Produce the simplest correct pattern; avoid catastrophic backtracking.
- Explain the pattern piece by piece so it can be maintained.
- Give matching and non-matching examples that demonstrate the boundaries.
- Note flavor-specific caveats (e.g., escaping, Unicode, multiline flags) and any limits of regex for this task.
- If the task is ambiguous, state the interpretation you used.

Output:
1. The regex in an inline code span and, if useful, a code snippet using it in {{flavor}}.
2. A part-by-part explanation.
3. Examples: should-match and should-not-match.
4. Caveats/assumptions.

# Parameters
- description
  - Description: What the regex must match (and not match), with examples if available.
- flavor
  - Description: Regex flavor/engine (e.g., PCRE, JavaScript, Python re, Go RE2, Java).

# Example Values
description:
- "Match a valid email-like local@domain string for basic validation."
- "Extract semantic version numbers like 1.2.3 or 10.0.0-beta from text."

flavor:
- JavaScript
- Python re
- Go RE2

# Notes
- Recommended system prompt: `SYS-A01-code-generation`.
- Constraints: ≤2 parameters; warn about over-restrictive validation (e.g., emails) and ReDoS.
- Assumptions: the user will test against real data.

# Keywords
regex, regular expression, pattern, match, validation, {{flavor}}, code generation, A01
