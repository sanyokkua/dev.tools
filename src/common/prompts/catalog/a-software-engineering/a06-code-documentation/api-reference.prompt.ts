import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A06-api-reference',
    categoryCode: 'A06',
    title: 'Write API Reference Documentation',
    subtitle: 'Factual reference docs for an API surface from spec or code',
    description: 'Factual reference docs for an API surface from spec or code',
    variantAxes: [],
    defaultVariantId: 'USR-A06-doc-apiReference',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A06-doc-apiReference',
            kind: 'user',
            categoryCode: 'A06',
            title: 'Write API Reference Documentation',
            description: 'Write API Reference Documentation',
            template: `You are a documentation engineer. Produce reference documentation for the Application Programming Interface (API) surface below. Reference docs are factual and information-oriented (Diátaxis "reference" mode) — describe what exists, not tutorials or opinions.

API source (spec or code):
\`\`\`
{{specOrCode}}
\`\`\`

For each endpoint or public function, document:
1. Name / path / method (for HTTP) or signature (for a library).
2. Purpose (one line, active voice: "Returns…", "Creates…").
3. Parameters/inputs: name, type, required?, description.
4. Returns / response: shape and status codes (for HTTP).
5. Errors: codes/exceptions and when they occur.
6. A minimal request/response or call example.

Rules: document only what the source defines; do not invent endpoints, fields, or status codes. Keep entries consistent and scannable. Mark anything ambiguous as "TODO: confirm".

Output contract: the reference docs in Markdown, one consistent entry per item.

Worked example —
Input: an Express route \`router.get('/users/:id', ...)\` returning a user or 404.
Expected entry: \`### GET /users/:id\` · "Returns a single user by id." · Parameters: \`id\` (path, string, required). · Returns: \`200\` with \`{ id, name, email }\`; \`404\` if not found. · Example: \`GET /users/42\` → \`200 { "id": "42", "name": "...", "email": "..." }\`.
`,
            parameters: [
                {
                    name: 'specOrCode',
                    label: 'API source (spec or code)',
                    description: 'An API spec (OpenAPI/SDL/proto) or the code/handlers defining the surface',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: { specOrCode: ['<an Express router with 4 routes>', '<an OpenAPI fragment for /users>'] },
            keywords: ['API reference', 'endpoints', 'OpenAPI', 'parameters', 'responses', 'A06'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A06-code-documentation',
            relatedPromptIds: ['LP-A07-api-design', 'AGT-A06-document-code'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
