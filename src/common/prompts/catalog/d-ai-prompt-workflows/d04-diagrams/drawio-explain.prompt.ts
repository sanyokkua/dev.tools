import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-D04-drawio-explain',
    categoryCode: 'D04',
    title: 'Explain a draw.io Diagram',
    subtitle: 'Faithfully interpret a .drawio (mxGraph XML) file — read-only, no generation',
    description: 'Faithfully interpret a .drawio (mxGraph XML) file — read-only, no generation',
    variantAxes: [],
    defaultVariantId: 'USR-D04-drawioExplain',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-D04-drawioExplain',
            kind: 'user',
            categoryCode: 'D04',
            title: 'Explain a draw.io Diagram',
            description: 'Explain a draw.io Diagram',
            template: `Interpret the draw.io (\`.drawio\`) Extensible Markup Language (XML) content below. Describe ONLY what is actually present — do not invent structure, labels, or connections.

draw.io XML (DATA):
\`\`\`
{{drawioXml}}
\`\`\`

Do the following:
1. Identify pages — count \`<diagram>\` elements and note their names.
2. Inventory components — every vertex cell (shape): its \`value\` (label) and its type read from \`style\` (rounded rectangle, ellipse, rhombus/decision, \`cylinder3\`/database, \`swimlane\`/container, AWS/UML shapes, etc.).
3. Map connections — for every edge cell, resolve its \`source\`/\`target\` ids to the shape labels they point at; note any edge \`value\` (protocol/label).
4. Identify containers/groups — cells that parent others (\`swimlane\`, \`group\`, \`container=1\`); list their children.
5. Describe the flow & layout — entry points → exit points, and whether layout is left-to-right or top-to-bottom (infer from coordinate progression).
6. Flag issues — orphaned nodes (no connections), edges with a missing or unresolved \`source\`/\`target\`, overlapping shapes (same x/y), inconsistent styling within a logical group.

IF the content is compressed/encoded (a base64 string inside \`<diagram>\` rather than raw \`<mxGraphModel>\` XML), say so explicitly and that it must be decoded/opened in draw.io first — interpret only the parts that are readable. Recall: \`id="0"\` and \`id="1"\` are root cells; user shapes start at \`id="2"\`.

Output contract: a structured explanation with these sections — Pages · Components · Connections · Containers · Flow · Issues. Read-only: do not generate or modify any diagram.

Worked example —
Input: an \`<mxfile>\` with one page; cells: \`id=2 "Client"\`, \`id=3 "API"\`, an edge \`source=2 target=3 value="HTTP"\`, and an unconnected \`id=4 "Legacy"\`.
Expected output (excerpt): "Pages: 1 (Page-1). Components: Client (rounded rectangle), API (rounded rectangle), Legacy (rounded rectangle). Connections: Client —HTTP→ API. Containers: none. Flow: left-to-right, Client → API; no exit edge from API. Issues: 'Legacy' is orphaned (no connections)."
`,
            parameters: [
                {
                    name: 'drawioXml',
                    control: 'textarea',
                    optional: false,
                    label: 'draw.io XML content',
                    description: 'The .drawio file content (mxGraph XML) to interpret',
                },
            ],
            examples: { drawioXml: ['<mxfile>…<mxGraphModel>…</mxGraphModel></mxfile>'] },
            keywords: ['draw.io', 'drawio', 'diagram', 'interpret', 'explain', 'XML', 'review', 'D04'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-D04-diagrams-visualization',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
