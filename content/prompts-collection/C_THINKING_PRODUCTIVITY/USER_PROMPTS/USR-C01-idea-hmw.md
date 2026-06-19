# Prompt ID
USR-C01-idea-hmw

# Domain / Category
C — Thinking & Productivity / C01 Ideation

# Description
Single-shot prompt that reframes a problem or insight into well-scoped "How Might We…" questions.

# Prompt
Reframe the problem/insight below into a set of "How Might We…?" (HMW) questions suitable for ideation. Each HMW should be in the sweet spot — not too broad ("how might we improve everything") and not solution-baked ("how might we build app X"). Ground them in the actual problem/insight. Produce 3–6 HMW questions at different angles (e.g., remove the obstacle, amplify the good, explore the opposite, question the assumption).

Problem / insight:
```
{{problemOrInsight}}
```

Output: a list of 3–6 HMW questions, each one line. Note which one looks most promising to ideate on first.

# Parameters
- problemOrInsight
  - Description: The problem statement or research insight to reframe.

# Example Values
problemOrInsight:
- "Users abandon signup at the SMS-verification step on poor connections."
- "Support tickets spike every Monday morning."

# Notes
- Recommended system prompt: `SYS-C01-ideation`.
- Constraints: 1 param; well-scoped HMWs; grounded in the input.
- Related: `USR-C01-idea-generate` (ideate on the chosen HMW).

# Keywords
How Might We, HMW, reframe, problem framing, ideation, C01
