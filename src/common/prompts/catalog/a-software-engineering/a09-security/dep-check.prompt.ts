import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A09-dep-check',
    categoryCode: 'A09',
    title: 'Check Dependencies for Supply-Chain Risk',
    subtitle: 'Flag unpinned, abandoned, typosquatted, or unverifiable packages',
    description: 'Flag unpinned, abandoned, typosquatted, or unverifiable packages',
    variantAxes: [],
    defaultVariantId: 'USR-A09-sec-depCheck',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A09-sec-depCheck',
            kind: 'user',
            categoryCode: 'A09',
            title: 'Check Dependencies for Supply-Chain Risk',
            description: 'Check Dependencies for Supply-Chain Risk',
            template: `You are an application security analyst focused on supply-chain risk. Review the dependency list below and flag risks.

Dependencies (manifest or list):
\`\`\`
{{dependencies}}
\`\`\`

Check for and flag:
1. **Unpinned / loose version ranges** that could pull breaking or malicious updates (\`*\`, \`latest\`, broad \`^\`/\`~\`).
2. **Typosquatting / hallucination risk** — names that look like common packages but may be impostors, or that you cannot confirm exist (model-suggested names can be fabricated — "slopsquatting"; recommend verifying each against the official registry).
3. **Likely abandoned / unmaintained** packages (flag for verification — do not assert maintenance status as fact).
4. **Over-broad or risky** dependencies (deprecated, known-problematic categories).
5. **Duplication / bloat** where a smaller/standard option exists.

Rules: do not assert a specific Common Vulnerabilities and Exposures (CVE) or version as vulnerable unless it is provided in the input — instead recommend running a real Software Composition Analysis (SCA)/audit tool (\`npm audit\`, \`pip-audit\`, OSV-Scanner, Snyk). Be explicit about what must be VERIFIED versus what is a CONFIRMED observation.

Output contract: a table — Package · Risk type · Why · Recommended action (pin / verify on registry / replace / run SCA). End with the top actions.

Worked example —
Input: "express ^4, lodash *, reqwest, momentjs, leftpad-utils"
Expected (excerpt):
| Package | Risk type | Why | Action |
|---|---|---|---|
| lodash \`*\` | Unpinned | \`*\` pulls any version incl. malicious updates | pin to a known-good range |
| reqwest | Typosquat/verify | resembles \`request\`/\`requests\` — confirm it's the intended package | verify on registry |
| momentjs | Abandoned (verify) | moment is in maintenance mode; consider date-fns/Luxon | verify + plan replace |
| leftpad-utils | Hallucination risk | cannot confirm this package exists | verify on registry before adding |
Top actions: pin all loose ranges; verify reqwest and leftpad-utils on the registry; run \`npm audit\`.
`,
            parameters: [
                {
                    name: 'dependencies',
                    label: 'Dependency manifest or list',
                    description: 'The dependency manifest or list (e.g., package.json deps, requirements.txt)',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: {
                dependencies: [
                    'express ^4, lodash *, reqwest, momentjs, leftpad-utils',
                    'requests==2.31.0, beautifulsoup, py-cryptohelper',
                ],
            },
            keywords: ['dependencies', 'supply chain', 'slopsquatting', 'typosquatting', 'pinning', 'SCA', 'A09'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A09-security',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
