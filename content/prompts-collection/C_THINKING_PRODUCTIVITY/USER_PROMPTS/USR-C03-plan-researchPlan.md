# Prompt ID
USR-C03-plan-researchPlan

# Domain / Category
C — Thinking & Productivity / C03 Planning

# Description
Single-shot, parameterized prompt that decomposes a research question into a structured research plan (sub-questions, themes, sources, next steps).

# Prompt
Create a structured research plan for the topic below. Do NOT answer the questions — produce the plan.

1. Restate the topic to confirm scope.
2. Decompose it into MECE sub-questions (mutually exclusive, collectively exhaustive where possible), grouped into themes.
3. Note clarifying questions where the scope is ambiguous.
4. For each theme, suggest the kinds of sources/methods to use and how to tell a credible source.
5. Prioritize the sub-questions and define a stopping criterion (when is the research "done enough").

Topic: ```{{topic}}```
Domain context (optional): ```{{context}}```
Audience level (optional): ```{{audience}}```

Output: the research plan — restated topic · clarifying questions · themed sub-questions · sources/methods per theme · prioritized question list · stopping criterion.

# Parameters
- topic
  - Description: The research topic/question.
- context
  - Description: Optional domain context (e.g., "for a technical audience", "B2B SaaS").
- audience
  - Description: Optional audience level (e.g., novice, practitioner, expert).

# Example Values
topic:
- "How should we evaluate vector databases for our use case?"
- "What are best practices for prompt caching?"

context:
- "engineering decision, mid-size product team"
- (blank)

audience:
- practitioner
- (blank)

# Notes
- Recommended system prompt: `SYS-C03-planning` (or `SYS-C04-research-synthesis`).
- Constraints: 3 params; plan only (don't answer); MECE decomposition.
- Related: `USR-C04-research-questions`, `USR-C04-research-synthesize` (after gathering).

# Keywords
research plan, sub-questions, MECE, themes, scope, stopping criterion, C03
