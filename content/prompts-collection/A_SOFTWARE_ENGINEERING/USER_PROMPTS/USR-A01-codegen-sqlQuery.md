# Prompt ID
USR-A01-codegen-sqlQuery

# Domain / Category
A — Software Engineering / A01 Code Generation

# Description
Single-shot prompt that writes a SQL query for a stated need, in a specified dialect, against a given schema.

# Prompt
You are a SQL expert. Write a correct, readable SQL query for the {{dialect}} dialect that satisfies the need below.

Need:
```
{{description}}
```

Schema (tables/columns available):
```
{{schema}}
```

Rules:
- Use only tables/columns present in the schema; do not invent objects. If the schema is insufficient, say what is missing and provide the closest correct query with stated assumptions.
- Prefer explicit column lists over `SELECT *`; use parameter placeholders for user-supplied values (never string-concatenate input).
- Use {{dialect}}-correct syntax and functions; add brief comments for non-obvious logic.
- Note performance considerations (indexes, large scans) where relevant.

Output:
1. The query in a fenced ```sql block.
2. A one-line explanation of what it returns and the row grain.
3. Assumptions and any performance notes.

# Parameters
- description
  - Description: The data need in plain language (what rows/aggregations are wanted).
- schema
  - Description: Relevant tables and columns (DDL or a concise list).
- dialect
  - Description: SQL dialect (e.g., PostgreSQL, MySQL, SQL Server, BigQuery, Snowflake).

# Example Values
description:
- "Top 10 customers by total order value in the last 90 days."
- "Monthly active users per plan tier for this year."

schema:
- "customers(id, name); orders(id, customer_id, total, created_at)"
- "users(id, plan_id, last_active_at); plans(id, tier)"

dialect:
- PostgreSQL
- BigQuery

# Notes
- Recommended system prompt: `SYS-A01-code-generation`.
- Constraints: 3 parameters (max); parameterized values; no invented schema objects.
- Related: `USR-A01-codegen-cqlQuery` (Cassandra), `USR-A11-logQuery` (log queries).

# Keywords
SQL, query, database, {{dialect}}, schema, joins, aggregation, code generation, A01
