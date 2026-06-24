import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-D04-drawio-build',
    categoryCode: 'D04',
    title: 'Build or Modify a draw.io Diagram',
    subtitle: 'Generate valid .drawio (mxGraph XML) from a description — chat + repository-aware agent twin',
    description: 'Generate valid .drawio (mxGraph XML) from a description — chat + repository-aware agent twin',
    variantAxes: ['mode'],
    defaultVariantId: 'USR-D04-drawio-build',
    modeClass: 'dual',
    variants: [
        {
            id: 'USR-D04-drawio-build',
            kind: 'user',
            categoryCode: 'D04',
            title: 'Build or Modify a draw.io Diagram',
            description: 'Build or Modify a draw.io Diagram',
            template: `Produce a valid draw.io (\`.drawio\`) diagram as mxGraph Extensible Markup Language (XML) for the request below. The XML must open cleanly in diagrams.net / draw.io.

Request (a new diagram to build, OR a change to make — if changing, the existing XML is included below):
\`\`\`
{{description}}
\`\`\`
Requested diagram type (blank = infer): {{diagramType}}

USE THIS FILE SKELETON. The cells \`id="0"\` and \`id="1"\` are required root cells; user shapes start at \`id="2"\` and increment; every shape has \`parent="1"\` unless it sits inside a container (then \`parent\` = the container's id):
\`\`\`xml
<mxfile host="app.diagrams.net">
  <diagram name="Page-1">
    <mxGraphModel dx="800" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <!-- user shapes start here, id="2"+ -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
\`\`\`

A VERTEX (shape) cell and an EDGE (connector) cell look like this:
\`\`\`xml
<mxCell id="2" value="User Service" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
  <mxGeometry x="80" y="80" width="160" height="60" as="geometry" />
</mxCell>
<mxCell id="10" value="HTTP/REST" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;" edge="1" parent="1" source="2" target="3">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
\`\`\`

SHAPE / STYLE VOCABULARY (pick by role):
- Process / service: \`rounded=1;whiteSpace=wrap;html=1;\`   • Plain rectangle: \`rounded=0;whiteSpace=wrap;html=1;\`
- Decision: \`rhombus;whiteSpace=wrap;html=1;\`   • Start/End: \`ellipse;whiteSpace=wrap;html=1;\`
- Database: \`shape=cylinder3;whiteSpace=wrap;html=1;\`   • I/O: \`shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;\`
- Container / tier (titled group): \`swimlane;startSize=30;html=1;\` (children use \`parent="<containerId>"\` with geometry relative to it)
- External system: add \`dashed=1;\` and the neutral grey colour.
- Edge routing: \`edgeStyle=orthogonalEdgeStyle;\` for right angles; label the connector via its \`value\` (e.g. protocol). For decisions, always label the branches (\`value="Yes"\`, \`value="No"\`).

NOTE-STYLE COLOUR PRESETS (fillColor / strokeColor — keep colour coding consistent by role):
- Services, clients (blue): \`#dae8fc\` / \`#6c8ebf\`
- Databases, success (green): \`#d5e8d4\` / \`#82b366\`
- Queues, decisions (yellow): \`#fff2cc\` / \`#d6b656\`
- Gateways, APIs (orange): \`#ffe6cc\` / \`#d79b00\`
- Errors, alerts (red/pink): \`#f8cecc\` / \`#b85450\`
- External, neutral (grey): \`#f5f5f5\` / \`#666666\`
- Security, auth (purple): \`#e1d5e7\` / \`#9673a6\`

Rules:
1. Lay out left-to-right (LR) or top-to-bottom (TB) by flow; space shapes ~160–200px apart so nothing overlaps. Use ≥4 tiers → prefer TB.
2. Every edge's \`source\` and \`target\` MUST reference an existing cell id — no dangling references, no orphaned shapes (every shape connected unless it is intentionally a legend/label).
3. Escape XML inside \`value\`/\`style\`: \`&\`→\`&amp;\`, \`<\`→\`&lt;\`, \`>\`→\`&gt;\`, \`"\`→\`&quot;\`; use \`&#xa;\` for a line break inside a label.
4. If MODIFYING existing XML: keep all unrelated cells and their ids unchanged; only add/edit the cells the request needs; reuse the existing colour/shape conventions.
5. Keep ids unique; group related shapes in a \`swimlane\` container when they form a tier.

Output contract: ONLY the complete \`.drawio\` XML (the full \`<mxfile>…</mxfile>\`), ready to save as a \`.drawio\` file. No prose.
`,
            parameters: [
                {
                    name: 'description',
                    control: 'textarea',
                    optional: false,
                    label: 'What to build (or change)',
                    description: 'The diagram to create, or the change to make plus the existing .drawio XML',
                },
                {
                    name: 'diagramType',
                    control: 'select',
                    optional: true,
                    label: 'Diagram type',
                    description: 'Force a specific type (architecture, flowchart, ER, etc.); blank = infer',
                    valueSetId: 'diagram-type',
                },
            ],
            examples: {
                description: [
                    'a simple flow: Client calls API Gateway, which calls the Orders service, which reads the Orders database',
                    'an ER diagram of customers, orders, and products with their relationships',
                ],
                diagramType: ['Architecture diagram', ''],
            },
            keywords: ['draw.io', 'drawio', 'mxGraph', 'XML', 'build', 'diagram', 'architecture', 'ER', 'D04'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-D04-diagrams-visualization',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'AGT-D04-drawio-embed',
            kind: 'agent',
            categoryCode: 'D04',
            title: 'Agent: Build or Modify a draw.io Diagram',
            description: 'Agent: Build or Modify a draw.io Diagram',
            template: `You are a diagramming agent working INSIDE the repository at \`{{repo_path}}\`. Create or update a draw.io diagram file (mxGraph Extensible Markup Language [XML]) that opens cleanly in diagrams.net.

What to build / change (or source to derive it from):
\`\`\`
{{description}}
\`\`\`
Target \`.drawio\` file: \`{{target_file}}\`
Requested diagram type (blank = infer): {{diagramType}}

Workflow:
1. GROUND IT: if the request points at code/specs, traverse and read the relevant files so the diagram reflects what the repository ACTUALLY does. Cite real paths. Do not invent components or connections.
2. IF \`{{target_file}}\` EXISTS: read it first. Detect whether content is raw \`<mxGraphModel>\` XML or a compressed/encoded \`<diagram>\` string. If it is compressed, do NOT guess at the bytes — report that it must be opened/decoded in draw.io first, and either regenerate from the description or stop. If raw XML, preserve all unrelated cells and ids; only add/edit what the change needs; reuse the existing colour/shape conventions.
3. BUILD using the standard skeleton (required root cells \`id="0"\`/\`id="1"\`; user shapes \`id="2"\`+; \`parent="1"\` unless inside a container). Shape vocabulary: service/process \`rounded=1;whiteSpace=wrap;html=1;\`, decision \`rhombus;…\`, database \`shape=cylinder3;…\`, container \`swimlane;startSize=30;…\`, external \`dashed=1;\`. Colour by role (blue services, green databases, yellow queues/decisions, orange gateways, red errors, grey external, purple security). Right-angle edges via \`edgeStyle=orthogonalEdgeStyle;\`; label branches on decisions.
4. VALIDATE before writing: well-formed XML; every edge \`source\`/\`target\` resolves to a real cell; no orphaned shapes; ids unique; XML special chars escaped (\`&amp; &lt; &gt; &quot;\`, \`&#xa;\` for line breaks); no overlapping geometry.
5. WRITE \`{{target_file}}\` (create the directory if needed).

Constraints: ground in real repo facts; cite real paths; never invent structure; never corrupt unrelated cells in an existing file; never silently overwrite a compressed/encoded file you could not read.

Output (summary): the path written, whether it was created or modified, the diagram type, the shapes/edges added or changed, and the source paths it was derived from. End with \`DRAWIO_BUILD_COMPLETE\`.
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
                    label: 'What to build/change (or source to derive it from)',
                    description:
                        'The diagram to create or the change to make, optionally pointing at code/spec to ground it',
                },
                {
                    name: 'target_file',
                    control: 'text',
                    optional: false,
                    label: 'Target .drawio file',
                    description: 'The .drawio file to create or update (e.g. docs/diagrams/architecture.drawio)',
                },
                {
                    name: 'diagramType',
                    control: 'select',
                    optional: true,
                    label: 'Diagram type',
                    description: 'Force a specific type; blank = infer',
                    valueSetId: 'diagram-type',
                },
            ],
            examples: {
                description: [
                    'Build an architecture diagram of the services under src/ and the queues they use.',
                    'Update docs/diagrams/flow.drawio to add the new payments service between checkout and the bank gateway.',
                ],
                target_file: ['docs/diagrams/architecture.drawio'],
            },
            keywords: ['agent', 'repository', 'draw.io', 'mxGraph', 'XML', 'build', 'embed', 'architecture', 'D04'],
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
