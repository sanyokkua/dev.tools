import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-D04-mermaid',
    categoryCode: 'D04',
    title: 'Generate a Mermaid Diagram',
    subtitle: 'A render-ready Mermaid diagram from a description — chat + repository-aware agent twin',
    description: 'A render-ready Mermaid diagram from a description — chat + repository-aware agent twin',
    variantAxes: ['mode'],
    defaultVariantId: 'USR-D04-mermaid',
    modeClass: 'dual',
    variants: [
        {
            id: 'USR-D04-mermaid',
            kind: 'user',
            categoryCode: 'D04',
            title: 'Generate a Mermaid Diagram',
            description: 'Generate a Mermaid Diagram',
            template: `Create a Mermaid diagram for the description below. The output must render correctly on the FIRST attempt.

Description:
\`\`\`
{{description}}
\`\`\`

Requested diagram type (blank = you choose): {{diagramType}}

STEP 1 — Choose the type (if not forced). Flow/pipeline/decision tree → \`flowchart\`; interactions/message order → \`sequenceDiagram\`; data model → \`erDiagram\`; types/classes → \`classDiagram\`; lifecycle/transitions → \`stateDiagram-v2\`; system architecture at zoom levels → \`C4Context\`/\`C4Container\`/\`C4Component\`; schedule → \`gantt\`; git branching → \`gitGraph\`. Default to \`flowchart\` if ambiguous. Spell the keyword EXACTLY — it is case-sensitive: \`gitGraph\` (not \`gitgraph\`), \`stateDiagram-v2\` (not \`stateDiagram\`/v1), \`C4Context\`. A wrong-case keyword fails with "No diagram type detected".

STEP 2 — Size budget. Keep it under ~25–30 nodes. If the description needs more, split into multiple diagrams (or subgraphs) and say so — large single diagrams become unreadable and are more likely to mis-render.

STEP 3 — Apply these render-reliability rules (these are the common failure causes):
- Node IDs: letters/digits/underscore only, MUST start with a letter. No spaces, hyphens, dots, or colons. Use descriptive IDs (\`authService\`, not \`n1\`). Keep IDs unique.
- Reserved words are NEVER bare IDs: \`end\`, \`class\`, \`subgraph\`, \`graph\`, \`flowchart\`, \`default\`, \`style\`, \`linkStyle\`, \`click\`, \`classDef\`, \`direction\`, \`participant\`, \`actor\`, \`title\`, \`section\`. THE \`end\` GOTCHA: a bare \`end\` closes a \`subgraph\` — rename to \`endNode\`/\`endState\`, and if a label text is literally "end", quote it as \`["end"]\`.
- Quote every label that has spaces or punctuation: \`A["User Service"]\`, \`C{"Is Valid?"}\`, \`D[("Database")]\`.
- HTML-entity-encode characters that collide with syntax, inside labels: \`"\`→\`#34;\`, \`(\`→\`#40;\`, \`)\`→\`#41;\`, \`[\`→\`#91;\`, \`]\`→\`#93;\`, \`{\`→\`#123;\`, \`}\`→\`#125;\`, \`<\`→\`#60;\`, \`>\`→\`#62;\`, \`|\`→\`#124;\`, \`\\\`→\`#92;\`, \`#\`→\`#35;\`. Note the double-percent trap: \`%%\` inside a label is read as a comment — encode it \`#37;#37;\`.
- Label length: keep labels under ~50 characters; wrap long text with \`<br/>\` (never \`\\n\`).
- Flowcharts MUST declare a direction on the first line: \`TD\`, \`LR\`, \`BT\`, or \`RL\`.
- Match EVERY block-opener with \`end\`: \`subgraph\`/\`end\`, and in sequence diagrams \`alt\`/\`opt\`/\`loop\`/\`par\`/\`critical\`/\`break\`/\`rect\` each need \`end\`.
- Edge labels use pipe or dashed form: \`A -->|"Yes"| B\` or \`A -- "label" --> B\` (not \`A --> "Yes" B\`).
- Comments only on their own line; never inline after an element. No trailing semicolons.
- Class diagrams are the MOST render-fragile — keep them simple: the \`<<abstract>>\`/\`<<interface>>\` stereotype already marks the class, so omit per-method abstract markers (\`method()*\`) unless required; prefer a plain labelled association (\`A --> B : has\`) over two-sided cardinality+label; generics use \`~\` not \`<>\` (\`List~String~\`) — but see the Markdown note below. State diagrams: use \`stateDiagram-v2\`, not v1. C4 needs Mermaid 9.2+; \`block-beta\`, \`xychart-beta\`, \`sankey-beta\` are EXPERIMENTAL and may not render on GitHub/GitLab — if you must use one, add a one-line caveat outside the code block.
- If the diagram will be pasted into a MARKDOWN document, keep the body free of Markdown-fragile tokens: \`~text~\` (→ strikethrough — so avoid class generics \`List~T~\`; use a plain type), a *pair* of \`*\` (→ italics — e.g. an abstract \`*\` plus a \`"*"\` cardinality), \`_text_\`, and \`[text]\` outside quotes. These get corrupted before Mermaid sees them and cause "Syntax error in text".

STEP 4 — Self-validate before output: exact case-sensitive type keyword; IDs valid/unique/not reserved; labels quoted and special chars encoded; flowchart direction declared; every block-opener has \`end\`; arrows valid; no inline comments / trailing semicolons; class diagrams kept simple; no Markdown-fragile tokens if it will be embedded; chosen type fits the intent; experimental-type caveat added if relevant. (Note: passing a parser/linter is not the same as rendering — when you can, prefer the simplest construct that conveys the meaning.)

Output contract: ONLY a fenced \`\`\`mermaid code block (plus a single caveat line above it ONLY when an experimental type is used).
`,
            parameters: [
                {
                    name: 'description',
                    control: 'textarea',
                    optional: false,
                    label: 'What to depict',
                    description: 'The entities, flow, and relationships the diagram should show',
                },
                {
                    name: 'diagramType',
                    control: 'select',
                    optional: true,
                    label: 'Diagram type',
                    description: 'Force a specific type; leave blank to auto-select (flowchart if ambiguous)',
                    valueSetId: 'diagram-type',
                },
            ],
            examples: {
                description: [
                    'the login flow: user → app → auth service → database, with a failure path',
                    'order, customer, and product tables and their relationships',
                ],
                diagramType: ['Sequence diagram', ''],
            },
            keywords: ['mermaid', 'diagram', 'flowchart', 'sequence', 'ER', 'C4', 'render', 'validation', 'D04'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-D04-diagrams-visualization',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'AGT-D04-mermaid-embed',
            kind: 'agent',
            categoryCode: 'D04',
            title: 'Agent: Generate a Mermaid Diagram',
            description: 'Agent: Generate a Mermaid Diagram',
            template: `You are a diagramming agent working INSIDE the repository at \`{{repo_path}}\`. Create a Mermaid diagram and embed it into repository documentation. The diagram must render on the first attempt.

What to depict (or source to derive it from):
\`\`\`
{{description}}
\`\`\`
Target documentation file: \`{{target_doc}}\`
Requested diagram type (blank = you choose): {{diagramType}}

Workflow:
1. GROUND IT: if the description points at code or a spec, traverse and read the relevant files first so the diagram reflects what the repository ACTUALLY does. Cite the real paths you used. Do not invent components, calls, or tables.
2. CHOOSE the type and SIZE it (under ~25–30 nodes; split if larger).
3. BUILD applying the full render-reliability rules: EXACT case-sensitive type keyword (\`gitGraph\` not \`gitgraph\`, \`stateDiagram-v2\` not v1); valid/unique non-reserved IDs (mind the \`end\` gotcha — \`endNode\`, \`["end"]\`); quoted labels; HTML-entity-encode \`"(){}[]<>|\\#\` and \`%%\`→\`#37;#37;\`; labels under ~50 chars with \`<br/>\`; flowchart direction declared; every \`subgraph\`/\`alt\`/\`opt\`/\`loop\` matched with \`end\`; edge labels in pipe/dashed form; comments on their own line; no trailing semicolons; C4 needs Mermaid 9.2+; experimental types (\`block-beta\`, \`xychart-beta\`, \`sankey-beta\`) may not render on GitHub/GitLab. KEEP CLASS DIAGRAMS SIMPLE (stereotype marks abstractness — omit \`method()*\`; plain associations over cardinality+label). Because the diagram is embedded in a Markdown doc, avoid Markdown-fragile tokens in the body — \`~text~\` (so no \`List~T~\` generics — use a plain type), a pair of \`*\`, \`_text_\`, \`[text]\` outside quotes — they corrupt the source before Mermaid sees it.
4. SELF-VALIDATE against the rules in step 3 before writing.
5. EMBED into \`{{target_doc}}\`: write the fenced \`\`\`mermaid block under a descriptive heading with a one-line caption explaining what it shows. Create the file/section if needed; do not clobber unrelated content.

Constraints: ground the diagram in real repo facts; cite real paths; never invent structure; keep the existing doc intact around the insertion.

Output (summary): the path written, the heading added, the diagram type, the node count, and the source paths it was derived from. End with \`MERMAID_COMPLETE\`.
`,
            parameters: [
                {
                    name: 'repo_path',
                    control: 'text',
                    optional: false,
                    label: 'Repository path',
                    description: 'Path to the repository',
                },
                {
                    name: 'description',
                    control: 'textarea',
                    optional: false,
                    label: 'What to depict (or source to derive it from)',
                    description:
                        'The flow/architecture/data model to diagram, or a pointer to the code/spec to derive it from',
                },
                {
                    name: 'target_doc',
                    control: 'text',
                    optional: false,
                    label: 'Target documentation file',
                    description: 'The Markdown doc to embed the diagram into (e.g. docs/architecture.md)',
                },
                {
                    name: 'diagramType',
                    control: 'select',
                    optional: true,
                    label: 'Diagram type',
                    description: 'Force a specific type; leave blank to auto-select',
                    valueSetId: 'diagram-type',
                },
            ],
            examples: {
                description: [
                    'Diagram the request flow through src/api and src/services for the checkout path.',
                    'Generate an ER diagram of the schema defined in db/migrations/.',
                ],
                target_doc: ['docs/architecture.md'],
            },
            keywords: ['agent', 'repository', 'mermaid', 'embed', 'documentation', 'architecture', 'render', 'D04'],
            executionContext: 'agent',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-D04-diagrams-visualization',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
