# Prompt ID
USR-C02-decide-prosCons

# Domain / Category
C — Thinking & Productivity / C02 Decision Support

# Description
Single-shot prompt that lays out structured pros and cons for one or more options.

# Prompt
Lay out a structured pros/cons analysis for the option(s) below. For each option, list the genuine advantages and disadvantages, and note any that are especially significant. If this is a reversible ("two-way door") decision, say so and suggest deciding quickly. End with a balanced read of the trade-off — but leave the final call to the user.

Option(s):
```
{{options}}
```

Output: per option, **Pros** and **Cons** (concise bullets), then a short note on the key trade-off and whether the decision looks reversible.

# Parameters
- options
  - Description: One or more options to weigh (and any context).

# Example Values
options:
- "Adopt a monorepo for our three services."
- "Option A: build in-house vs Option B: buy a vendor solution."

# Notes
- Recommended system prompt: `SYS-C02-decision-support`.
- Constraints: 1 param; balanced; doesn't decide for the user.
- Related: `USR-C02-decide-weightedMatrix` (for many criteria), `USR-C02-decide-compareSolutions`.

# Keywords
pros cons, trade-off, decision, weigh options, reversible, C02
