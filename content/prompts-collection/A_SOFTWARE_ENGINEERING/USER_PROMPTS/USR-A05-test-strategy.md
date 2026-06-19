# Prompt ID
USR-A05-test-strategy

# Domain / Category
A — Software Engineering / A05 Testing

# Description
Single-shot prompt that proposes a pragmatic test strategy/plan for a feature or system, choosing test levels by risk.

# Prompt
You are a test engineer. Propose a pragmatic test strategy for the feature/system below.

Subject:
```
{{featureOrSystem}}
```

Cover:
- What to test at each level — unit (isolated logic), integration (components together), contract (service boundaries), e2e (key user journeys) — and roughly the proportion, justified by risk and cost.
- The highest-risk areas that deserve the most testing.
- Mocking boundaries (mock external I/O, not internal logic).
- Non-functional tests if relevant (performance, security, accessibility).
- What NOT to over-test (avoid brittle, low-value tests).

Output: a concise strategy — Test levels & focus · High-risk areas · Mocking boundaries · Non-functional considerations · Anti-over-testing notes. Keep it actionable, not academic.

# Parameters
- featureOrSystem
  - Description: The feature or system to design a test strategy for, with any known risks/constraints.

# Example Values
featureOrSystem:
- "A payment-processing service integrating a third-party gateway"
- "A new search feature over an existing product catalog"

# Notes
- Recommended system prompt: `SYS-A05-testing`.
- Constraints: 1 param; risk-driven; pragmatic over exhaustive.
- Related: `USR-A05-test-edgeCases`, `USR-A05-test-generate`.

# Keywords
test strategy, test plan, test pyramid, levels, risk-based, mocking, coverage, A05
