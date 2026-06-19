# Prompt ID
USR-A01-codegen-cqlQuery

# Domain / Category
A — Software Engineering / A01 Code Generation

# Description
Single-shot prompt that writes a Cassandra CQL query for a stated need against a given schema, respecting Cassandra's partition-key access model.

# Prompt
You are a Cassandra (CQL) expert. Write a correct CQL query for the need below against the given keyspace/schema.

Need:
```
{{description}}
```

Schema (keyspace, tables, partition & clustering keys):
```
{{schema}}
```

Rules:
- Respect Cassandra's data model: queries must filter by the partition key; clustering keys define ordering/range within a partition. Do NOT produce queries that require `ALLOW FILTERING` unless explicitly requested — instead, if the access pattern isn't supported by the current schema, say so and propose the table/secondary structure (e.g., a query-specific table or materialized view) that would support it.
- Use only tables/columns in the schema; do not invent objects.
- Avoid anti-patterns: unbounded multi-partition scans, large `IN` on partition keys, secondary indexes on high-cardinality columns.

Output:
1. The CQL in a fenced ```sql block (or a note that the schema cannot support the access pattern, plus the recommended modeling fix).
2. The partition/clustering keys it relies on and the row grain.
3. Assumptions and modeling notes.

# Parameters
- description
  - Description: The data access need in plain language.
- schema
  - Description: Keyspace/table definitions including partition and clustering keys.
- keyspace
  - Description: Target keyspace name (and replication context if relevant).

# Example Values
description:
- "Get the latest 20 events for a given device, newest first."
- "Look up a user profile by user_id."

schema:
- "events(device_id PK, event_time CK DESC, payload); "
- "users(user_id PK, name, email)"

keyspace:
- iot
- accounts

# Notes
- Recommended system prompt: `SYS-A01-code-generation`.
- Constraints: 3 parameters (max); query-driven modeling; avoid `ALLOW FILTERING` and scan anti-patterns.
- Related: `USR-A01-codegen-sqlQuery`, skill `SKILL-cassandra-expert` (in-repo modeling & review).

# Keywords
Cassandra, CQL, query, partition key, clustering key, data modeling, NoSQL, code generation, A01
