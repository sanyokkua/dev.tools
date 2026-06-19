# Prompt ID
USR-A04-debug-hypotheses

# Domain / Category
A — Software Engineering / A04 Debugging

# Description
Single-shot prompt that generates ranked, testable root-cause hypotheses for a hard-to-pin bug, each with a way to confirm or rule it out.

# Prompt
You are a debugging specialist. For the symptom and context below, generate ranked, testable hypotheses for the root cause.

Symptom:
```
{{symptom}}
```

Context (system, recent changes, environment, frequency):
```
{{context}}
```

Rules:
- Produce 3–5 distinct hypotheses, ordered most → least likely given the evidence.
- For each: the proposed cause, why it fits the symptom, and a concrete cheap test to confirm or rule it out (a command, a log to add, an input to try, a bisection).
- Favor hypotheses that are cheap to test and high-information. Note what evidence would most quickly narrow the field.

Output: a ranked list — Hypothesis · Why plausible · How to test (confirm/refute). End with the single most informative next experiment.

# Parameters
- symptom
  - Description: The observed failure/behavior.
- context
  - Description: System details, recent changes, environment, and how often it happens.

# Example Values
symptom:
- "Checkout occasionally charges twice"
- "Service memory grows until OOM after ~6 hours"

context:
- "Mobile clients on flaky networks; retries enabled; deployed last Tuesday"

# Notes
- Recommended system prompt: `SYS-A04-debugging`.
- Constraints: ≤2 params; 3–5 testable hypotheses; cheap-test bias.
- Related: `USR-A04-debug-diagnose`, `AGT-A04-diagnose`, `SKILL-log-root-cause`.

# Keywords
hypotheses, root cause, ranked, testable, debugging, isolate, experiment, A04
