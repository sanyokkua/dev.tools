import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A06-docstrings',
    categoryCode: 'A06',
    title: 'Add Documentation Comments',
    subtitle: 'Idiomatic docstrings for public members — chat + repository-aware agent twin',
    description: 'Idiomatic docstrings for public members — chat + repository-aware agent twin',
    variantAxes: ['mode'],
    defaultVariantId: 'USR-A06-doc-docstrings',
    modeClass: 'dual',
    variants: [
        {
            id: 'USR-A06-doc-docstrings',
            kind: 'user',
            categoryCode: 'A06',
            title: 'Add Documentation Comments',
            description: 'Add Documentation Comments',
            template: `You are a documentation engineer. Add documentation comments to the public/exported members of the {{language}} code below, following {{language}}'s conventions (e.g., JSDoc/TSDoc, Python docstrings, GoDoc, JavaDoc).

Code:
\`\`\`
{{code}}
\`\`\`

Rules:
1. Document every public/exported function, class, method, and type: purpose, parameters, return value, errors/exceptions, and important invariants. Skip private/internal members.
2. Describe what the code ACTUALLY does — do not invent behavior. Use active voice, concise and factual.
3. Comments explain WHY where the reason is non-obvious; do not restate the code.
4. Return the code with docs added, unchanged otherwise.

Output contract: the documented code in a fenced \`\`\`{{language}}\`\`\` block. Note any member whose behavior was unclear and needs author confirmation.
`,
            parameters: [
                {
                    name: 'language',
                    label: 'Programming language',
                    description: 'Programming language (determines doc style)',
                    control: 'select',
                    optional: false,
                    valueSetId: 'programming-language',
                },
                {
                    name: 'code',
                    label: 'Code',
                    description: 'The code to document',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: { code: ['<a module with several exported functions>'] },
            keywords: ['docstrings', 'API comments', 'JSDoc', 'GoDoc', 'JavaDoc', 'A06'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A06-code-documentation',
            relatedPromptIds: ['LP-A06-api-reference', 'LP-A06-explain-code'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'AGT-A06-document-code',
            kind: 'agent',
            categoryCode: 'A06',
            title: 'Agent: Add Documentation Comments',
            description: 'Add Documentation Comments',
            template: `You are a documentation engineer working as an autonomous agent INSIDE the repository at \`{{repo_path}}\`. Generate documentation derived strictly from the actual source.

Scope: {{target_paths}}
What to produce: {{doc_kind}}  (e.g., docstrings in-place, a module README, API reference, an architecture/overview doc)

Workflow:
1. INSPECT the in-scope source (and its tests, which reveal intended behavior) by traversing the repo. Determine the language's documentation conventions. Cite the real files you relied on.
2. For the requested \`doc_kind\`, generate documentation that reflects what the code ACTUALLY does — signatures, parameters, returns, errors, and the WHY behind non-obvious decisions. Use tests as the source of truth for examples; do not invent behavior or examples.
3. Apply the right Diátaxis mode for the artifact (reference vs how-to vs explanation) and keep modes unmixed.
4. WRITE the documentation to the appropriate location: docstrings in-place in the source files; standalone docs under \`docs/\` (or where the repo keeps docs), creating the file(s). Confirm before overwriting existing docs.

Constraints: factual (no invented APIs/behavior/examples); document public/exported members; mark anything ambiguous as "TODO: confirm"; minimal changes to source when adding docstrings (no logic changes).

Output (summary): files created/edited (real paths) · what was documented · doc mode used · any TODOs needing author confirmation. End with \`DOCS_COMPLETE\`.
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
                    label: 'Scope (files/modules/areas)',
                    description: 'The files/modules/areas to document',
                    control: 'text',
                    optional: false,
                },
                {
                    name: 'doc_kind',
                    label: 'Documentation artifact',
                    description: 'docstrings | module README | API reference | overview/explanation',
                    control: 'text',
                    optional: false,
                },
            ],
            examples: { target_paths: ['src/api/', 'pkg/scheduler/'], doc_kind: ['docstrings', 'API reference'] },
            keywords: ['agent', 'repository', 'documentation', 'docstrings', 'API docs', 'Diátaxis', 'A06'],
            executionContext: 'agent',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A06-code-documentation',
            relatedPromptIds: ['LP-A06-api-reference', 'LP-A06-explain-code'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
