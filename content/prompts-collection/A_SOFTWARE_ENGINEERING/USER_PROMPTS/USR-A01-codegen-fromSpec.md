# Prompt ID
USR-A01-codegen-fromSpec

# Domain / Category
A — Software Engineering / A01 Code Generation

# Description
Single-shot prompt that implements code from a specification or acceptance criteria, with attention to the stated behavior and edge cases.

# Prompt
You are an experienced {{language}} developer. Implement {{language}} code that satisfies the specification / acceptance criteria below.

Specification:
```
{{spec}}
```

Rules:
- Implement exactly what the spec states; satisfy each acceptance criterion. Cover the edge cases the spec implies.
- Use idiomatic {{language}}, clean structure, input validation, and error handling.
- Do not add features beyond the spec (YAGNI). Do not invent libraries/APIs.
- Where the spec is silent on a decision, choose the safest interpretation and record it as an assumption.

Output:
1. The implementation in fenced ```{{language}} block(s), organized sensibly.
2. A short mapping of each acceptance criterion → how the code satisfies it.
3. Assumptions and any spec ambiguities you resolved.

# Parameters
- language
  - Description: Target programming language (and version if relevant).
- spec
  - Description: The specification or acceptance criteria to implement.

# Example Values
language:
- Python 3.12
- Java 21
- TypeScript

spec:
- "GIVEN a cart with items, WHEN checkout is called, THEN apply a 10% discount over $100 and return the final total; reject empty carts."
- "Implement a rate limiter: max N requests per window per key; return remaining quota."

# Notes
- Recommended system prompt: `SYS-A01-code-generation`.
- Constraints: ≤2 parameters; implement-to-spec, no scope creep; no invented dependencies.
- Related: `USR-A05-test-generate`, `AGT-A01-implement` (implement within a repo using its conventions).

# Keywords
implement, specification, acceptance criteria, code generation, {{language}}, requirements, A01
