# Prompt ID
USR-A06-doc-diataxis

# Domain / Category
A — Software Engineering / A06 Code Documentation

# Description
Single-shot prompt that reshapes existing content into one specific Diátaxis documentation mode (tutorial, how-to, reference, or explanation).

# Prompt
You are a documentation engineer. Reshape the content below into a single Diátaxis documentation mode: {{mode}}.

Content:
```
{{user_text}}
```

Apply the chosen mode strictly:
- **Tutorial** (learning-oriented): a guided, ordered lesson a beginner can follow to a successful outcome; concrete steps, stated result.
- **How-to guide** (task-oriented): numbered steps to accomplish a specific goal for someone who already knows the basics.
- **Reference** (information-oriented): factual, structured description; no narrative or opinion.
- **Explanation** (understanding-oriented): the why/background, context and trade-offs; no step-by-step.

Rules: produce ONLY the chosen mode — do not mix modes. Use only information present in the content; mark gaps as "TODO: confirm". Match tone to the mode.

Output: the content rewritten in {{mode}}, in Markdown.

# Parameters
- user_text
  - Description: The existing content to reshape.
- mode
  - Description: Target Diátaxis mode: tutorial | how-to | reference | explanation.

# Example Values
user_text:
- "<mixed notes about a feature: some steps, some background, some API facts>"

mode:
- how-to
- reference

# Notes
- Recommended system prompt: `SYS-A06-code-documentation`.
- Constraints: ≤2 params; exactly one mode; no mode mixing.
- Related: `USR-A06-doc-readme`, `USR-B06-docstruct-instructions` (general instructional formatting).

# Keywords
Diátaxis, tutorial, how-to, reference, explanation, documentation mode, reshape, A06
