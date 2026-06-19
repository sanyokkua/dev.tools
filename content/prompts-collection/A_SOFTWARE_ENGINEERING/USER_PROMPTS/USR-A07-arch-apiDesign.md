# Prompt ID
USR-A07-arch-apiDesign

# Domain / Category
A — Software Engineering / A07 Architecture

# Description
Single-shot prompt that designs an API contract for stated requirements in a chosen style (REST/GraphQL/gRPC), contract-first.

# Prompt
You are an API architect. Design a contract-first API for the requirements below, in the {{style}} style.

Requirements:
```
{{requirements}}
```

Design rules:
- Model resources/operations clearly. For REST: nouns not verbs, correct HTTP methods/status codes, ≤2 nesting levels. For GraphQL: a clean schema avoiding over/under-fetching. For gRPC: clear service/messages.
- Define versioning (no breaking changes to a published version; additive changes preferred), pagination (prefer cursor at scale), filtering/sorting, idempotency for writes (idempotency key/request id), and a consistent error model.
- Keep it consistent and predictable; do not leak the database schema as the API.

Output:
1. The contract sketch (endpoints/schema/proto) in a fenced block.
2. Conventions: versioning, pagination, errors, idempotency, auth approach.
3. A short example request/response and any assumptions.

# Parameters
- requirements
  - Description: What the API must do — resources, operations, consumers, constraints.
- style
  - Description: API style — REST | GraphQL | gRPC.

# Example Values
requirements:
- "CRUD for orders + list by customer; public third-party consumers; needs caching."
- "Internal low-latency service-to-service inventory lookups."

style:
- REST
- gRPC

# Notes
- Recommended system prompt: `SYS-A07-architecture`.
- Constraints: ≤2 params; contract-first; no breaking changes to published versions.
- Related: `USR-A06-doc-apiReference` (document it), `USR-A07-arch-design`.

# Keywords
API design, REST, GraphQL, gRPC, contract-first, versioning, pagination, idempotency, A07
