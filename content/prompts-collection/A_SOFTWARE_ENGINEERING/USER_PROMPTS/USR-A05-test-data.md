# Prompt ID
USR-A05-test-data

# Domain / Category
A — Software Engineering / A05 Testing

# Description
Single-shot prompt that generates realistic, diverse test data in a requested format matching a given data model.

# Prompt
You are a test engineer. Generate realistic, diverse test data that matches the model below.

Data model (fields and types):
```
{{model}}
```

Output format: {{format}}
Number of records: {{count}}

Rules:
- Respect every field's type and any stated constraints; produce valid records by default.
- Make the data diverse and realistic (varied names, plausible values, edge values where useful); avoid obvious dummy repetition.
- Include a few boundary/edge records (e.g., min/max, empty optional fields) clearly, if useful for testing.
- Do not include real personal data; synthesize values. Keep output strictly in {{format}}.

Output: ONLY the dataset in {{format}} (a fenced block), with no commentary.

# Parameters
- model
  - Description: The object/record structure — fields, types, and constraints.
- format
  - Description: Output format (e.g., JSON, CSV, SQL INSERTs, YAML).
- count
  - Description: Number of records to generate.

# Example Values
model:
- "User { id: uuid, name: string, age: int(0-120), email: string, active: bool }"

format:
- JSON
- CSV

count:
- 10
- 50

# Notes
- Recommended system prompt: `SYS-A05-testing`.
- Constraints: 3 params; synthetic data only (no real PII); valid-by-default.
- Related: code-generating equivalent — ask `SYS-A01` for a data-generator script if you need reproducible large volumes.

# Keywords
test data, fixtures, synthetic data, JSON, CSV, model, generate, A05
