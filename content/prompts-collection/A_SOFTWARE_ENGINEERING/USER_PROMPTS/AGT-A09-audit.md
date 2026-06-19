# Prompt ID
AGT-A09-audit

# Domain / Category
A — Software Engineering / A09 Security (Repository-aware agent variant)

# Description
Repository-aware AI-agent prompt that performs a security audit across a repository, prioritizing OWASP-class issues, and produces a prioritized, defensive findings report (read-only by default).

# Prompt
You are an application security analyst working as an autonomous agent INSIDE the repository at `{{repo_path}}`. Perform a security audit. By default this is READ-ONLY — do not modify code.

Scope (optional — focus areas): {{target_paths}}

Workflow:
1. MAP attack surface: entry points (HTTP handlers, message consumers, CLI, jobs), trust boundaries, authn/authz points, data stores, secrets handling, and dependency manifest.
2. AUDIT for OWASP/SANS classes: injection (SQL/command/template), XSS, CSRF, broken access control/IDOR, insecure deserialization, SSRF, secrets in code/config, weak/home-rolled crypto, insecure config, unsafe input handling. For dependencies, flag unpinned/typosquatted/unverifiable packages and recommend running a real SCA tool (do not assert specific CVEs unless evidence is present).
3. TRACE each finding to file:line and explain why it is exploitable and the impact.
4. PRIORITIZE by realistic risk; provide concrete remediation (minimal example) per finding.

Constraints: defensive only — no exploit code/tooling; severity is an estimate (label it); never print secrets you find (redact); verify-not-assert for CVEs/maintenance status; minimal-diff only if explicitly asked to fix.

Output: a report — **Executive summary** · **Findings** (numbered: type · file:line · severity · why · remediation) grouped by severity · **Dependency notes** · **Recommended next tools** (SAST/SCA/DAST). End with `AUDIT_COMPLETE`.

# Parameters
- repo_path
  - Description: Path to the repository to audit.
- target_paths
  - Description: Optional focus areas (e.g., auth, API handlers); blank = whole repo.
- user_intent
  - Description: Optional — "audit only" (default) or "audit and propose fixes".

# Example Values
repo_path:
- ./

target_paths:
- "src/api/, src/auth/"
- (blank — whole repo)

user_intent:
- "audit only"
- "audit and propose fixes"

# Notes
- Recommended system prompt: `SYS-A09-security`.
- Constraints: read-only by default; defensive; redact secrets; verify-not-assert CVEs; ≤3 params.
- Assumptions: repo readable; complements (does not replace) SAST/SCA/DAST tools.
- Dependencies: chat twins `USR-A09-*`; packaged version `SKILL-security-audit`; pairs with `SKILL-config-scan`.
- Limitations: prompt-based audit can miss issues real scanners catch; recommend running them.

# Keywords
agent, repository, security audit, OWASP, attack surface, vulnerabilities, defensive, A09
