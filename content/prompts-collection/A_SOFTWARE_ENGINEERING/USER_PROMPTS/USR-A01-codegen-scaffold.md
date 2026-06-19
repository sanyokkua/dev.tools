# Prompt ID
USR-A01-codegen-scaffold

# Domain / Category
A — Software Engineering / A01 Code Generation

# Description
Single-shot prompt that scaffolds a new module/project skeleton in a given language, including a sensible structure and the requested libraries.

# Prompt
You are an experienced {{language}} developer. Produce an initial module/project scaffold for the purpose below.

Purpose & requirements:
```
{{spec}}
```

Rules:
- Propose a conventional, maintainable directory/file structure for {{language}} and the stated libraries/frameworks.
- Provide the key files with minimal, working starter code (entry point, core module(s), config, and a placeholder test).
- Keep it scalable and idiomatic; do not over-engineer. Do not invent libraries — name any third-party dependency and note it must be verified.
- State assumptions for anything unspecified.

Output:
1. A directory tree (as text).
2. The starter content for each key file in fenced blocks, labeled by path.
3. Setup/run notes and assumptions.

# Parameters
- language
  - Description: Target language/runtime (and version if relevant).
- spec
  - Description: What the module/project is for, plus required libraries/frameworks and any constraints.

# Example Values
language:
- Node.js 20 / TypeScript
- Python 3.12
- Go

spec:
- "A REST API service for managing tasks, using Express and a Postgres client; include a health endpoint."
- "A CLI tool that converts CSV to JSON, with subcommands and unit tests."

# Notes
- Recommended system prompt: `SYS-A01-code-generation`.
- Constraints: ≤2 parameters; idiomatic structure; no invented dependencies.
- Related: `AGT-A01-implement` (for scaffolding inside an existing repo following its conventions).

# Keywords
scaffold, project, module, boilerplate, structure, code generation, {{language}}, setup, A01
