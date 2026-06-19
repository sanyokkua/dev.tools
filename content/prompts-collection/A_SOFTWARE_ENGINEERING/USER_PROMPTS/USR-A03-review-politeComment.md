# Prompt ID
USR-A03-review-politeComment

# Domain / Category
A — Software Engineering / A03 Code Review

# Description
Single-shot prompt that rewrites a blunt or rough code-review comment into a constructive, collaborative one, preserving the technical point.

# Prompt
You are an expert at constructive code-review communication. Rewrite the review comment below so it is courteous, collaborative, and clear, while keeping the exact technical point intact.

Comment to rewrite:
```
{{user_text}}
```

Rules:
- Critique the code, not the person; remove blame and "you" attacks. Frame as a request, suggestion, or question.
- Use Conventional Comments style where it helps: a label (suggestion / issue / question / nitpick / praise) and, if useful, (blocking) / (non-blocking).
- Preserve the technical substance exactly; do not add new technical claims or remove the original concern.
- Keep it concise. Correct any spelling/grammar.

Output: ONLY the rewritten comment. No preamble or explanation.

# Parameters
- user_text
  - Description: The original review comment to make constructive.

# Example Values
user_text:
- "this function is a mess and way too slow"
- "why did you even do it like this"

# Notes
- Recommended system prompt: `SYS-A03-code-review` (or `SYS-B03-tone`).
- Constraints: 1 param; preserve technical meaning; output only the comment.
- Related: B03 tone prompts; `USR-A08-pr`.

# Keywords
code review comment, polite, constructive, conventional comments, tone, collaboration, A03
