# Prompt ID
USR-A09-sec-review

# Domain / Category
A — Software Engineering / A09 Security

# Description
Single-shot prompt that audits a code snippet for security vulnerabilities (OWASP Top 10 class) and provides remediation.

# Prompt
You are an application security analyst. Audit the {{language}} code below for security vulnerabilities. Report only security-relevant findings (no general style feedback).

Code:
```
{{code}}
```

Look for: injection (SQL/command/template), XSS, CSRF, broken access control / IDOR, insecure deserialization, SSRF, secrets exposure, weak/home-rolled crypto, insecure configuration, unsafe input handling.

For each finding: **[vulnerability type]** · Location · Severity (estimate: Critical/High/Medium/Low) · Why it is exploitable · Remediation (minimal corrected example). 

Rules: be defensive only — do not produce exploit code. Validate input server-side, fail closed, never log secrets. Severity is an estimate, label it so. If context is insufficient to judge a risk, say what's missing. Redact any secrets seen.

Output: numbered findings, then a summary grouped by severity. If none found, say so and note what was checked.

# Parameters
- language
  - Description: Language of the code.
- code
  - Description: The code to audit.

# Example Values
language:
- Python 3.12
- JavaScript / Node 20

code:
- "<a handler building a SQL string from request input>"

# Notes
- Recommended system prompt: `SYS-A09-security`.
- Constraints: ≤2 params; defensive only; severity is an estimate; redact secrets.
- Related: `USR-A09-sec-threatModel`, `USR-A09-sec-depCheck`, `AGT-A09-audit`, `SKILL-security-audit`.

# Keywords
security review, OWASP, vulnerability, injection, XSS, remediation, audit, {{language}}, A09
