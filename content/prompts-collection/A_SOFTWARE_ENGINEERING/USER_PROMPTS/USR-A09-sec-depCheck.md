# Prompt ID
USR-A09-sec-depCheck

# Domain / Category
A — Software Engineering / A09 Security

# Description
Single-shot prompt that reviews a dependency list for supply-chain risks: unpinned, abandoned, typosquatted, or unverifiable packages.

# Prompt
You are an application security analyst focused on supply-chain risk. Review the dependency list below and flag risks.

Dependencies (manifest or list):
```
{{dependencies}}
```

Check for and flag:
- **Unpinned / loose version ranges** that could pull breaking or malicious updates.
- **Typosquatting / hallucination risk** — names that look like common packages but may be impostors, or that you cannot confirm exist (LLM-suggested names can be fabricated — recommend verifying each against the official registry).
- **Likely abandoned / unmaintained** packages (flag for verification — do not assert maintenance status as fact).
- **Over-broad or risky** dependencies (deprecated, known-problematic categories).
- **Duplication / bloat** where a smaller/standard option exists.

Rules: do not assert a specific CVE or version as vulnerable unless it is provided in the input — instead recommend running a real SCA/audit tool. Be explicit about what must be verified vs what is a confirmed observation.

Output: a table — Package · Risk type · Why · Recommended action (pin / verify on registry / replace / run SCA). End with the top actions.

# Parameters
- dependencies
  - Description: The dependency manifest or list (e.g., package.json deps, requirements.txt).

# Example Values
dependencies:
- "express ^4, lodash *, reqwest, momentjs, leftpad-utils"
- "requests==2.31.0, beautifulsoup, py-cryptohelper"

# Notes
- Recommended system prompt: `SYS-A09-security`.
- Constraints: 1 param; verify-not-assert for CVEs/maintenance; recommend real SCA tooling.
- Related: `SKILL-security-audit`, `SKILL-config-scan`.

# Keywords
dependencies, supply chain, slopsquatting, typosquatting, pinning, SCA, security, A09
