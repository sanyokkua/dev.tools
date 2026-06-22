import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A02-improve',
    categoryCode: 'A02',
    title: 'Refactor for Readability',
    subtitle: 'Restructure a snippet preserving behavior — chat + repository-aware agent twin',
    description: 'Restructure a snippet preserving behavior — chat + repository-aware agent twin',
    variantAxes: ['mode'],
    defaultVariantId: 'USR-A02-refactor-improve',
    modeClass: 'dual',
    variants: [
        {
            id: 'USR-A02-refactor-improve',
            kind: 'user',
            categoryCode: 'A02',
            title: 'Refactor for Readability',
            description: 'Refactor for Readability',
            template: `You are a refactoring specialist. Refactor the {{language}} code below to improve readability and internal structure WITHOUT changing its observable behavior.

Code:
\`\`\`
{{code}}
\`\`\`

Optional goal/focus: {{goal}}

Rules:
1. Preserve observable behavior exactly. If achieving the goal would change behavior, STOP and say so (that would be a rewrite or a bug fix, not a refactor).
2. Apply small, named refactorings (Extract Function, Rename, Replace Conditional with Polymorphism, Introduce Parameter Object, Replace Temp with Query). Remove the specific smells you find; do not over-abstract.
3. Keep the public interface stable unless the goal explicitly allows changing it.

Output contract:
1. The refactored code in a fenced \`\`\`{{language}}\`\`\` block.
2. A short list of the changes made (smell → refactoring applied).
3. A "behavior preserved" note: what you relied on staying the same, and anything you could not safely change without tests.

Worked example —
Input language: "Python 3.12"; code: a 30-line function mixing parsing and validation with three nested \`if\`s; goal: "Separate parsing from validation".
Expected output: two functions — \`parse_input\` and \`validate_parsed\` — with guard clauses replacing nesting; changes list: "Extract Function (parse), Extract Function (validate), replace nested if with early returns"; behavior-preserved note: "same exceptions raised for the same bad inputs; return value identical for all sampled inputs."
`,
            parameters: [
                {
                    name: 'language',
                    label: 'Programming language',
                    description: 'Programming language of the snippet',
                    control: 'select',
                    optional: false,
                    valueSetId: 'programming-language',
                },
                {
                    name: 'code',
                    label: 'Code',
                    description: 'The code to refactor',
                    control: 'textarea',
                    optional: false,
                },
                {
                    name: 'goal',
                    label: 'Goal / focus',
                    description:
                        'Optional focus (e.g., "reduce nesting", "extract the validation logic"); blank = general readability',
                    control: 'text',
                    optional: true,
                },
            ],
            examples: {
                code: ['<a long function mixing parsing and validation>'],
                goal: ['Separate parsing from validation'],
            },
            keywords: ['refactor', 'readability', 'behavior preserving', 'code smell', 'A02'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A02-code-refactoring',
            relatedPromptIds: ['LP-A02-smells', 'LP-A02-plan', 'AGT-A05-generate-tests'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'AGT-A02-refactor',
            kind: 'agent',
            categoryCode: 'A02',
            title: 'Agent: Refactor for Readability',
            description: 'Refactor for Readability',
            template: `You are a refactoring specialist working as an autonomous agent INSIDE the repository at \`{{repo_path}}\`. Refactor the target code WITHOUT changing its observable behavior.

Target: {{target_paths}}
Goal/focus (optional): {{goal}}

Workflow:
1. INSPECT: traverse and read the target files and their callers/tests. Understand current behavior and the test coverage that guards it. Cite the real file paths you read.
2. SAFETY NET: if the target lacks tests, FIRST add characterization tests that pin current behavior, and RUN them. Do not refactor untested code blind.
3. REFACTOR in small, named steps (Extract Function, Rename, Replace Conditional with Polymorphism, Introduce Parameter Object). Run the tests after each meaningful step; keep them green.
4. SCOPE: touch only the target and what is strictly necessary. Do NOT change public APIs/behavior, reformat unrelated code, or mix in feature changes.
5. VERIFY: run the full relevant test suite; report actual results honestly.

Constraints: behavior must be preserved (tests green throughout); refactor-only (no feature/behavior changes); minimal blast radius; do not invent Application Programming Interfaces (APIs).

Output (verification summary): files changed (real paths) · refactorings applied (smell → change) · tests added/used · commands run + actual results · "behavior preserved" confirmation · remaining smells deferred. End with \`REFACTOR_COMPLETE\`.
`,
            parameters: [
                {
                    name: 'repo_path',
                    label: 'Repository path',
                    description: 'Path to the repository',
                    control: 'text',
                    optional: false,
                },
                {
                    name: 'target_paths',
                    label: 'Target file(s)/module(s)',
                    description: 'The file(s)/module(s) to refactor',
                    control: 'text',
                    optional: false,
                },
                {
                    name: 'goal',
                    label: 'Goal / focus',
                    description:
                        'Optional focus (e.g., "extract the pricing logic", "reduce nesting"); blank = general structure/readability',
                    control: 'text',
                    optional: true,
                },
            ],
            examples: { target_paths: ['src/billing/invoice.ts', 'app/services/order_service.rb'] },
            keywords: ['agent', 'repository', 'refactor', 'behavior preserving', 'characterization tests', 'A02'],
            executionContext: 'agent',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A02-code-refactoring',
            relatedPromptIds: ['LP-A02-smells', 'LP-A02-plan', 'AGT-A05-generate-tests'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
