# Prompt ID
USR-A06-doc-readme

# Domain / Category
A — Software Engineering / A06 Code Documentation

# Description
Single-shot prompt that drafts a clear, well-structured README from a description of a project.

# Prompt
You are a documentation engineer. Draft a README in Markdown for the project described below.

Project information:
```
{{projectInfo}}
```

Include these sections (omit any with no available information rather than padding):
- Title + one-line description.
- What it is / why it exists.
- Quickstart: install and run (minimal steps).
- Usage: the most common examples.
- Configuration (key options/env vars), if any.
- Project structure (brief), if useful.
- Contributing & license, if applicable.

Rules:
- Lead with a quickstart so a new user succeeds fast. Be concrete; use only details present in the input. Do not invent commands, package names, or license terms — mark unknowns as "TODO: confirm".
- Conversational-but-professional tone; scannable headings.

Output: ONLY the README in Markdown.

# Parameters
- projectInfo
  - Description: What the project does, stack, install/run steps, and any config/usage details available.

# Example Values
projectInfo:
- "A CLI that converts CSV to JSON. Node 20. Install via npm i -g csv2json. Usage: csv2json input.csv."
- "A Python library for parsing invoices; pip install; exposes parse(path)."

# Notes
- Recommended system prompt: `SYS-A06-code-documentation`.
- Constraints: 1 param; quickstart-first; no invented commands; mark unknowns.
- Related: `AGT-A06-document-code`, `SKILL-project-documentation` (generate from a real repo).

# Keywords
README, quickstart, onboarding, documentation, usage, install, Markdown, A06
