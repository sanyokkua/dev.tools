# Prompt ID
USR-A07-arch-rfc

# Domain / Category
A — Software Engineering / A07 Architecture

# Description
Single-shot prompt that drafts an RFC / design proposal exploring at least two options before a decision is made.

# Prompt
You are a software architect. Draft an RFC (design proposal) for the problem below. An RFC explores options BEFORE a decision and invites comment — it does not just assert a choice.

Problem / proposal:
```
{{problem}}
```

Options to consider (if given): {{options}}

Produce:
- **Summary** — the problem and what's being proposed, in a few sentences.
- **Context & goals** — why now; the requirements and quality attributes that matter.
- **Options** — at least two genuine options; for each: how it works, pros, cons, cost/risk.
- **Recommendation** — the proposed option and why, with the trade-offs accepted.
- **Open questions** — what reviewers should weigh in on.

Rules: present options fairly (no strawmen); support positions with reasons; use only facts from the input, marking gaps as "TODO: confirm".

Output: ONLY the RFC in Markdown.

# Parameters
- problem
  - Description: The problem/change to propose and explore.
- options
  - Description: Optional candidate options; blank = propose them.

# Example Values
problem:
- "How should we deliver async work: queue vs event bus vs DB outbox?"
- "Introduce caching for the product catalog read path."

options:
- "managed queue | Kafka | DB outbox"
- (blank)

# Notes
- Recommended system prompt: `SYS-A07-architecture`.
- Constraints: ≤2 params (options optional); ≥2 fair options.
- Related: `USR-A07-arch-adr` (record the decision after), `USR-A07-arch-tradeoff`.

# Keywords
RFC, design proposal, options, recommendation, exploration, architecture, A07
