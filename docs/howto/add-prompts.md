# How to Add Prompts to the Collection

## Source location

All prompt data lives in `src/common/prompts/`:

| File                       | Purpose                                                                         |
| -------------------------- | ------------------------------------------------------------------------------- |
| `prompts.ts`               | `PromptType` enum, `PromptCategory` enum, `Prompt` / `PromptParametrized` types |
| `system-prompts.ts`        | System prompt entries                                                           |
| `user-prompts.ts`          | User prompt entries                                                             |
| `dev-chat-user-prompts.ts` | Conversation-focused user prompt entries                                        |
| `prompts-library.ts`       | Aggregates all three arrays, sorts by `id`, exports `promptsLibraryList`        |

---

## PromptType values

| Value                                           | Use when                                                 |
| ----------------------------------------------- | -------------------------------------------------------- |
| `SYSTEM_PROMPT`                                 | Core instructions that define AI behavior for a session  |
| `USER_PROMPT_PARAMETRIZED`                      | Task-focused prompts with variable placeholders          |
| `USER_PROMPT_PARAMETRIZED_CONVERSATION_FOCUSED` | Conversation-oriented prompts with variable placeholders |

---

## Steps

1. **Choose the target file** based on the prompt type:
    - `SYSTEM_PROMPT` → `system-prompts.ts`
    - `USER_PROMPT_PARAMETRIZED` → `user-prompts.ts`
    - `USER_PROMPT_PARAMETRIZED_CONVERSATION_FOCUSED` → `dev-chat-user-prompts.ts`

2. **Pick or create a `PromptCategory`**. Existing categories:

    ```
    CODE_GENERATION, CODE_REFACTORING, CODE_REVIEW, CODE_ANALYSIS,
    SECURITY_ANALYSIS, DEBUGGING_ASSISTANCE, TEST_GENERATION,
    CODE_DOCUMENTATION, ARCHITECTURE_DESIGN, TECHNICAL_RESEARCH,
    CI_CD_PIPELINE, FRONTEND_SPECIFIC, API_DESIGN, MIGRATION_GUIDANCE,
    UX_IMPLEMENTATION, INTERNATIONALIZATION, MONITORING_SETUP,
    IMAGE_PROMPT_GENERATION, TEXT_PROOFREADING, TEXT_FORMATTING,
    TEXT_TRANSLATION, TASK_RESEARCH_PROMPT, AGILE_USER_STORY_GENERATION,
    PROMPT_ENGINEERING
    ```

3. **Add the entry** following the `Prompt` / `PromptParametrized` shape:

    ```ts
    {
      id: 'my-unique-id',
      type: PromptType.USER_PROMPT_PARAMETRIZED,
      category: PromptCategory.CODE_GENERATION,
      tags: ['typescript', 'generation'],
      description: 'Generate a TypeScript function for {{task}}',
      parameters: ['task'],
      template: 'Write a TypeScript function that {{task}}. ...',
    }
    ```

    - `id` must be unique across all three source files.
    - `parameters` lists every `{{placeholder}}` used in `template`.
    - For `SYSTEM_PROMPT` entries, omit `parameters` and use the `Prompt` type instead of `PromptParametrized`.

4. **No wiring needed** — `prompts-library.ts` aggregates all three arrays automatically.

5. **If adding a new `PromptCategory`**:
    - Add the enum value to `prompts.ts`.
    - Run `npx jest test/common/prompts.test.ts` to confirm no type errors.

6. **Run the full pipeline**: `npm run verify`.

---

## Notes

- Keep `id` values kebab-case and descriptive (e.g. `ts-function-generator`, `sql-query-optimizer`).
- `description` is shown in the UI as a one-line summary — keep it short.
- `template` supports multi-line strings; use a template literal.
- `tags` are used for search filtering — prefer existing tags before inventing new ones.
