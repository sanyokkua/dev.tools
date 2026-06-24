import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A09-review',
    categoryCode: 'A09',
    title: 'Security Review of Code',
    subtitle: 'Audit code for OWASP-class vulnerabilities — chat + repository-aware agent twin',
    description: 'Audit code for OWASP-class vulnerabilities — chat + repository-aware agent twin',
    variantAxes: ['mode'],
    defaultVariantId: 'USR-A09-sec-review',
    modeClass: 'dual',
    variants: [
        {
            id: 'USR-A09-sec-review',
            kind: 'user',
            categoryCode: 'A09',
            title: 'Security Review of Code',
            description: 'Security Review of Code',
            template: `You are an application security analyst. Audit the {{language}} code below for security vulnerabilities. Report only security-relevant findings (no general style feedback).

Code:
\`\`\`
{{code}}
\`\`\`

Look for these vulnerability classes (Open Web Application Security Project (OWASP) Top 10 and related):
1. Injection — SQL, command, template, LDAP, NoSQL.
2. Cross-Site Scripting (XSS) — reflected, stored, DOM-based.
3. Cross-Site Request Forgery (CSRF) — state-changing requests without anti-CSRF protection.
4. Broken access control / Insecure Direct Object Reference (IDOR) — missing authorization, user-controlled identifiers.
5. Insecure deserialization — untrusted data deserialized into objects.
6. Server-Side Request Forgery (SSRF) — user-controlled URLs fetched by the server.
7. Secrets exposure — hardcoded keys/passwords/tokens; secrets in logs.
8. Weak / home-rolled cryptography — MD5/SHA1 for passwords, ECB mode, static IVs, custom crypto.
9. Insecure configuration — debug on, permissive CORS, missing security headers, default creds.
10. Unsafe input handling — path traversal, unvalidated redirects, mass assignment.

Per-finding output schema (use exactly these fields):
- **[vulnerability type]** — the class name.
- **Location** — function/line or code excerpt.
- **Severity** — Critical / High / Medium / Low (label "(estimate)").
- **Why it is exploitable** — the concrete attack.
- **Remediation** — minimal corrected code example.

Rules: be defensive only — do not produce exploit code. Validate input server-side, fail closed, never log secrets. If context is insufficient to judge a risk, say what's missing. Redact any secrets seen.

Output contract: numbered findings in the schema above, then a summary grouped by severity. If none found, say so and note what was checked.
`,
            parameters: [
                {
                    name: 'language',
                    label: 'Programming language',
                    description: 'Language of the code',
                    control: 'select',
                    optional: false,
                    valueSetId: 'programming-language',
                },
                {
                    name: 'code',
                    label: 'Code to audit',
                    description: 'The code to audit',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: { code: ['<a handler building a SQL string from request input>'] },
            keywords: ['security review', 'OWASP', 'vulnerability', 'injection', 'XSS', 'remediation', 'A09'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A09-security',
            relatedPromptIds: ['LP-A09-threat-model', 'LP-A09-dep-check'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'AGT-A09-audit',
            kind: 'agent',
            categoryCode: 'A09',
            title: 'Agent: Security Review of Code',
            description: 'Security Review of Code',
            template: `You are an application security analyst working as an autonomous agent INSIDE the repository at \`{{repo_path}}\`. Perform a security audit. By default this is READ-ONLY — do not modify code ({{user_intent}}).

Scope (optional — focus areas): {{target_paths}}

Workflow:
1. MAP attack surface by traversing the repo: entry points (HTTP handlers, message consumers, CLI, jobs), trust boundaries, authentication/authorization points, data stores, secrets handling, and the dependency manifest. Cite real file paths.
2. AUDIT for OWASP/SANS classes: injection (SQL/command/template), Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), broken access control / Insecure Direct Object Reference (IDOR), insecure deserialization, Server-Side Request Forgery (SSRF), secrets in code/config, weak/home-rolled crypto, insecure config, unsafe input handling. For dependencies, flag unpinned/typosquatted/unverifiable packages and recommend running a real Software Composition Analysis (SCA) tool (do not assert specific CVEs unless evidence is present).
3. TRACE each finding to file:line and explain why it is exploitable and the impact.
4. PRIORITIZE by realistic risk; provide concrete remediation (minimal example) per finding.

Constraints: defensive only — no exploit code/tooling; severity is an estimate (label it); never print secrets you find (redact); verify-not-assert for CVEs/maintenance status; minimal-diff only if explicitly asked to fix.

Output: a report — **Executive summary** · **Findings** (numbered: type · file:line · severity · why · remediation) grouped by severity · **Dependency notes** · **Recommended next tools** (SAST/SCA/DAST). End with \`AUDIT_COMPLETE\`.
`,
            parameters: [
                {
                    name: 'repo_path',
                    label: 'Repository path',
                    description: 'Path to the repository to audit',
                    control: 'text',
                    optional: false,
                },
                {
                    name: 'target_paths',
                    label: 'Focus areas (optional)',
                    description: 'Optional focus areas (e.g., auth, API handlers); blank = whole repo',
                    control: 'text',
                    optional: true,
                },
                {
                    name: 'user_intent',
                    label: 'Mode',
                    description: 'Optional — "audit only" (default) or "audit and propose fixes"',
                    control: 'text',
                    optional: true,
                },
            ],
            examples: { target_paths: ['src/api/, src/auth/'], user_intent: ['audit only', 'audit and propose fixes'] },
            keywords: ['agent', 'repository', 'security audit', 'OWASP', 'attack surface', 'defensive', 'A09'],
            executionContext: 'agent',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A09-security',
            relatedPromptIds: ['LP-A09-threat-model', 'LP-A09-dep-check'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
