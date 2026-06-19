# Prompt ID
USR-C02-decide-weightedMatrix

# Domain / Category
C — Thinking & Productivity / C02 Decision Support

# Description
Single-shot prompt that scores options against weighted criteria and recommends honestly, treating near-ties as ties.

# Prompt
Build a weighted decision matrix for the options and criteria below.

Options:
```
{{options}}
```

Criteria (with weights/importance if given):
```
{{criteria}}
```

Method:
1. Options as columns, weighted criteria as rows. If weights aren't given, propose reasonable ones (sum to 1.0 or 1–5 importance) and label them as proposed.
2. Score each option per criterion (1–5); briefly note the basis for non-obvious scores.
3. Multiply score × weight; sum per option.
4. Treat results within ~10–15% as a tie to be decided on judgment, not the number. Do NOT reverse-engineer scores to a desired winner.

Output: the matrix with weighted totals · the leading option(s) with the key drivers · its main downside · and what would change the result.

# Parameters
- options
  - Description: The options to compare.
- criteria
  - Description: The decision criteria and their weights/importance.

# Example Values
options:
- "Kafka | RabbitMQ | SQS"
- "Vendor A | Vendor B | build in-house"

criteria:
- "throughput (0.3), ops burden (0.25), familiarity (0.2), cost (0.15), ecosystem (0.1)"

# Notes
- Recommended system prompt: `SYS-C02-decision-support`.
- Constraints: ≤2 params; honest scoring; near-ties = ties.
- Related: `USR-A07-arch-tradeoff` (architecture-specific), `USR-C02-decide-prosCons`.

# Keywords
weighted matrix, decision, score, criteria, options, recommend, C02
