# Prompt ID
USR-A04-debug-diagnose

# Domain / Category
A — Software Engineering / A04 Debugging

# Description
Single-shot prompt that diagnoses a defect from an error, the relevant code, and context, proposing a minimal fix and a regression test.

# Prompt
You are a debugging specialist. Diagnose the defect using the information below, following the scientific method.

Error / symptom:
```
{{error}}
```

Relevant code & context (language, framework, environment, repro):
```
{{context}}
```

Rules:
- Identify the most likely root cause from the evidence; if multiple are plausible, rank them and state how to distinguish.
- Propose the smallest fix that addresses the root cause (not the symptom).
- Provide a regression test that would fail before the fix and pass after.
- Do not present a guess as certainty; label confidence. If a critical piece (e.g., full stack trace or repro) is missing and blocks diagnosis, state exactly what you need.

Output: **Issue** · **Most likely cause** (with evidence + confidence) · **Fix** (concrete change) · **Regression test** · **Verification steps**. Redact any secrets seen.

# Parameters
- error
  - Description: The error message, stack trace, or described symptom.
- context
  - Description: Relevant code plus language/framework/environment and reproduction steps if known.

# Example Values
error:
- "TypeError: cannot read properties of undefined (reading 'id')"
- "Intermittent 500s under load; no stack trace"

context:
- "Node 20 / Express handler; <code>; happens only when query param is absent"

# Notes
- Recommended system prompt: `SYS-A04-debugging`.
- Constraints: ≤2 params; root cause over symptom; label confidence; redact secrets.
- Related: `USR-A04-debug-hypotheses`, `AGT-A04-diagnose` (across repo files), `SKILL-log-root-cause`.

# Keywords
debug, diagnose, root cause, error, stack trace, regression test, fix, A04
