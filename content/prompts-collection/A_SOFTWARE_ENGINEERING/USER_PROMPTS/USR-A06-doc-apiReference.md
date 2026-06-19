# Prompt ID
USR-A06-doc-apiReference

# Domain / Category
A — Software Engineering / A06 Code Documentation

# Description
Single-shot prompt that produces reference documentation for an API surface (endpoints or library functions) from a spec or code.

# Prompt
You are a documentation engineer. Produce reference documentation for the API surface below. Reference docs are factual and information-oriented (Diátaxis "reference" mode) — describe what exists, not tutorials or opinions.

API source (spec or code):
```
{{specOrCode}}
```

For each endpoint or public function, document:
- Name / path / method (for HTTP) or signature (for a library).
- Purpose (one line, active voice: "Returns…", "Creates…").
- Parameters/inputs: name, type, required?, description.
- Returns / response: shape and status codes (for HTTP).
- Errors: codes/exceptions and when they occur.
- A minimal request/response or call example.

Rules: document only what the source defines; do not invent endpoints, fields, or status codes. Keep entries consistent and scannable. Mark anything ambiguous as "TODO: confirm".

Output: the reference docs in Markdown, one consistent entry per item.

# Parameters
- specOrCode
  - Description: An API spec (OpenAPI/SDL/proto) or the code/handlers defining the surface.

# Example Values
specOrCode:
- "<an Express router with 4 routes>"
- "<an OpenAPI fragment for /users>"

# Notes
- Recommended system prompt: `SYS-A06-code-documentation`.
- Constraints: 1 param; reference mode only; no invented surface.
- Related: `USR-A07-arch-apiDesign` (designing the API), `AGT-A06-document-code`.

# Keywords
API reference, endpoints, documentation, OpenAPI, parameters, responses, reference mode, A06
