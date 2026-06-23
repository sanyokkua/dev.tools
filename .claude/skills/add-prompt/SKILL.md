---
name: add-prompt
description: Add a prompt or skill to the dev.tools prompts collection (TypeScript catalog workflow)
---

# Add a Prompt (or Skill)

Prompt data lives in `src/common/prompts/catalog/` as TypeScript modules. Adding a prompt means creating a `.prompt.ts` file and registering it in the category `index.ts`. Then run `npm run build:prompts` to validate and regenerate the manifest.

## Directory layout

```
src/common/prompts/catalog/
  a-software-engineering/
    a01-code-generation/
      sys.prompt.ts        ← SYS-A01 system prompt
      function.prompt.ts   ← LP-A01-function logical prompt
      from-spec.prompt.ts  ← LP-A01-from-spec (dual variant)
      index.ts             ← barrel: exports prompts array
    a02-code-refactoring/
    ...
    index.ts               ← domain barrel: re-exports all categories
  b-writing-communication/
  c-thinking-productivity/
  d-ai-prompt-workflows/
  index.ts                 ← top-level barrel: re-exports all domains
```

---

## Domains

| Code | Title                   | Directory                  |
| ---- | ----------------------- | -------------------------- |
| A    | Software Engineering    | `a-software-engineering/`  |
| B    | Writing & Communication | `b-writing-communication/` |
| C    | Thinking & Productivity | `c-thinking-productivity/` |
| D    | AI & Prompt Workflows   | `d-ai-prompt-workflows/`   |

---

## The `LogicalPromptDef` shape

Every `.prompt.ts` file exports a `prompt` constant of type `LogicalPromptDef`:

```typescript
import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A01-function', // globally unique; LP-<DOMAIN><NN>-<slug>
    categoryCode: 'A01',
    title: 'Generate a Function',
    subtitle: 'Short subtitle shown in the UI',
    description: 'One-line description',
    variantAxes: [], // [] for single-variant; ['mode'] for dual
    defaultVariantId: 'USR-A01-codegen-function',
    modeClass: 'chat-only', // 'chat-only' | 'dual' | 'chat-only-meta'
    variants: [
        {
            id: 'USR-A01-codegen-function',
            kind: 'user', // 'user' | 'system' | 'agent'
            categoryCode: 'A01',
            title: 'Generate a Function',
            description: '...',
            template: `Your template with {{param_name}} placeholders.`,
            parameters: [
                {
                    name: 'language',
                    label: 'Programming language',
                    description: 'Target language and version',
                    control: 'select', // 'select' | 'textarea' | 'text' | 'combobox'
                    optional: false,
                    valueSetId: 'programming-language',
                },
                {
                    name: 'requirements',
                    label: 'Requirement',
                    description: 'What the function must do',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: { requirements: ['Example value 1', 'Example value 2'] },
            keywords: ['keyword1', 'keyword2', 'A01'],
            executionContext: 'chat', // 'chat' | 'agent'
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A01-code-generation',
            relatedPromptIds: ['LP-A01-class'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
```

For a **dual-mode prompt** (chat + agent): set `modeClass: 'dual'`, `variantAxes: ['mode']`, two variants — `kind: 'user'` + `executionContext: 'chat'` and `kind: 'agent'` + `executionContext: 'agent'`.

For a **system prompt**: set `modeClass: 'chat-only-meta'`, `kind: 'system'`, omit `parameters` / `recommendedSystemPromptId`.

---

## Naming conventions

| Type           | ID format          | File name          |
| -------------- | ------------------ | ------------------ |
| Logical prompt | `LP-<A01>-<slug>`  | `<slug>.prompt.ts` |
| System prompt  | `SYS-<A01>-<slug>` | `sys.prompt.ts`    |

- `<A01>` = domain letter + two-digit category number.
- `<slug>` = kebab-case, starts with a letter.

---

## Steps: adding a prompt

- [ ]   1. **Pick domain and category.** Browse `src/common/prompts/catalog/` for the right `<domain>/<category>/` directory.

- [ ]   2. **Create the `.prompt.ts` file**:

    ```bash
    touch src/common/prompts/catalog/a-software-engineering/a01-code-generation/my-slug.prompt.ts
    ```

- [ ]   3. **Write the module** following the shape above. Use `a01-code-generation/function.prompt.ts` as the canonical example.

- [ ]   4. **Register in the category barrel** (`index.ts`):

    ```typescript
    import { prompt as mySlugPrompt } from './my-slug.prompt.ts';

    export const prompts: LogicalPromptDef[] = [
        // ...existing prompts...
        mySlugPrompt,
    ];
    ```

- [ ]   5. **Validate**:

    ```bash
    npm run build:prompts
    ```

    Expected: validators V01–V14 all pass; `manifest.generated.ts` and `loaders.generated.ts` regenerated (git-ignored).

- [ ]   6. **Run test suite**:

    ```bash
    npm run verify
    ```

    If adding a new category, add shape tests in `test/common/prompts/catalog-shape.test.ts`.

- [ ]   7. **Commit source files only** (do NOT commit generated files):

    ```bash
    git add src/common/prompts/catalog/
    git commit -m "feat(prompts): add LP-A01-my-slug"
    git status   # must be clean; generated files must NOT appear
    ```

---

## Steps: adding a skill

Skills live in `src/common/prompts/skills/<slug>/` as TypeScript modules with bundled file content.

- [ ]   1. **Create the skill directory and module**:

    ```bash
    mkdir -p src/common/prompts/skills/my-skill
    touch src/common/prompts/skills/my-skill/skill.ts
    ```

- [ ]   2. **Write `skill.ts`** following the existing skill shape (see `src/common/prompts/skills/` for examples). Bundle any file content as inline TypeScript string exports.

- [ ]   3. **Register in the skills barrel** (`src/common/prompts/skills/index.ts`):

    Add an import and include the skill in the exported array.

- [ ]   4. **Validate and verify**:

    ```bash
    npm run build:prompts
    npm run verify:ui
    ```

---

## Validation errors

| Error message                                        | Cause                                                           | Fix                                                       |
| ---------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------- |
| `Duplicate ID: <id>`                                 | Another prompt already uses this ID                             | Change `id` to something globally unique                  |
| `Missing recommendedSystemPromptId target: <sys-id>` | `recommendedSystemPromptId` references an ID that doesn't exist | Add the system prompt or fix the reference                |
| `Invalid control type: <type>`                       | `control` value is not one of the allowed set                   | Use `select`, `textarea`, `text`, or `combobox`           |
| `Dual prompt missing agent/chat variant`             | `modeClass: 'dual'` but only one variant                        | Add the missing `kind: 'agent'` or `kind: 'user'` variant |
| `Parameter name contains abbreviation`               | Validator V09 rejects abbreviated param names                   | Use the full word (e.g. `requirements` not `req`)         |
