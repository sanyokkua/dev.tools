# Prompt ID
USR-A07-arch-tradeoff

# Domain / Category
A — Software Engineering / A07 Architecture

# Description
Single-shot prompt that builds a weighted trade-off matrix comparing options against criteria, with an honest recommendation.

# Prompt
You are a software architect. Build a weighted trade-off matrix comparing the options against the criteria below, then recommend honestly.

Options:
```
{{options}}
```

Criteria (with importance, if given):
```
{{criteria}}
```

Rules:
- Put options as columns, weighted criteria as rows. Score each option per criterion (e.g., 1–5) and note the basis for non-obvious scores.
- Compute weighted totals, but treat the result as an INPUT to judgment, not an oracle; if two options are within ~10–15%, call it a tie and decide on qualitative grounds.
- Name sensitivity points (a criterion that decides the outcome) and trade-off points (a property that helps one attribute and hurts another).
- Do not reverse-engineer scores to a predetermined answer; show the negatives of the recommended option.

Output: the matrix (with weighted totals) · sensitivity & trade-off points · an honest recommendation with rationale and conditions under which it would change.

# Parameters
- options
  - Description: The candidate options to compare.
- criteria
  - Description: Decision criteria and their relative importance/weights.

# Example Values
options:
- "Single Postgres | Postgres + read replica | Postgres + Cassandra read model"
- "Kafka | RabbitMQ | SQS"

criteria:
- "write consistency (5), read scalability (4), ops simplicity (5), cost (3), team familiarity (4)"

# Notes
- Recommended system prompt: `SYS-A07-architecture` (also usable with `SYS-C02-decision-support`).
- Constraints: ≤2 params; honest scoring; ties within ~10–15%.
- Related: `USR-C02-decide-weightedMatrix` (general decisions), `USR-A07-arch-adr`.

# Keywords
trade-off matrix, weighted, options, criteria, decision, sensitivity, architecture, A07
