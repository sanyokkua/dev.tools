# Prompt ID
USR-C02-decide-rootCause

# Domain / Category
C — Thinking & Productivity / C02 Decision Support

# Description
Single-shot prompt that performs root-cause analysis on a problem using 5 Whys and/or a fishbone (cause categories), allowing multiple causes.

# Prompt
Perform a root-cause analysis of the problem below. Use both techniques as appropriate:
- **5 Whys** — ask "why?" iteratively along each causal chain; ground each step in evidence, and allow the chain to branch (a "why" can have several answers).
- **Fishbone (cause categories)** — sort candidate causes into categories (for processes/software, e.g., People, Process, Tooling/Infra, Data, Environment) to surface multiple parallel contributors.

Do NOT force a single root cause if several contribute. Flag which causes are evidenced vs assumed, and what to check to confirm.

Problem:
```
{{problem}}
```

Output: the cause categories with candidate causes · the 5-Whys chain(s) to the most likely root cause(s) · evidenced vs assumed · recommended countermeasures and what to verify.

# Parameters
- problem
  - Description: The problem/symptom to analyze.

# Example Values
problem:
- "Checkout conversion dropped 8% last week."
- "The nightly batch job keeps failing."

# Notes
- Recommended system prompt: `SYS-C02-decision-support`.
- Constraints: 1 param; allow multiple causes; evidenced vs assumed.
- Related: `USR-A04-debug-hypotheses` (code defects), `SKILL-log-root-cause`.

# Keywords
root cause, 5 Whys, fishbone, Ishikawa, problem analysis, C02
