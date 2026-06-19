# Prompt ID
USR-C02-decide-prioritize

# Domain / Category
C — Thinking & Productivity / C02 Decision Support

# Description
Single-shot, parameterized prompt that ranks a backlog/list of items using a chosen prioritization model (RICE, ICE, WSJF, or MoSCoW).

# Prompt
Prioritize the items below using the {{method}} model. Apply it correctly:
- **RICE** = (Reach × Impact × Confidence) ÷ Effort. (Impact: Massive 3, High 2, Medium 1, Low 0.5, Minimal 0.25; Confidence as %.)
- **ICE** = Impact × Confidence × Ease.
- **WSJF** = Cost of Delay ÷ Job Size (Cost of Delay = User/Business value + Time criticality + Risk reduction/opportunity).
- **MoSCoW** = sort into Must / Should / Could / Won't (this time); keep Must ≤ ~60% of effort.

For score-based methods: where an input isn't given, propose a reasonable value and mark it as an estimate. Show the inputs and the computed score per item, then rank. Treat scores within ~15% as ties. Note that scores are relative and built on estimates — a structuring aid, not an oracle.

Items:
```
{{items}}
```

Output: a table (item · inputs · score) ranked high→low (or the MoSCoW buckets), plus caveats on low-confidence or strategic items that under-score.

# Parameters
- items
  - Description: The backlog/list of items to prioritize (with any known reach/impact/effort).
- method
  - Description: RICE | ICE | WSJF | MoSCoW.

# Example Values
items:
- "Slack integration; dashboard widgets; performance overhaul; onboarding checklist"

method:
- RICE
- MoSCoW

# Notes
- Recommended system prompt: `SYS-C02-decision-support`.
- Constraints: ≤2 params; correct formula; relative scores; ties within ~15%.
- Related: `USR-C03-plan-estimate` (effort inputs), `USR-C02-decide-weightedMatrix`.

# Keywords
prioritize, RICE, ICE, WSJF, MoSCoW, backlog, ranking, C02
