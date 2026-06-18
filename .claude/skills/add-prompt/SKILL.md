---
name: add-prompt
description: Add a prompt to the dev.tools prompts collection
---

# Add a Prompt

Prompt data lives in `src/common/prompts/`. No code generation — edit the source files directly.

## File map

| File                                          | Contains                                                                      |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| `src/common/prompts/prompts.ts`               | `PromptType` enum, `PromptCategory` enum, `Prompt`/`PromptParametrized` types |
| `src/common/prompts/system-prompts.ts`        | System prompt entries                                                         |
| `src/common/prompts/user-prompts.ts`          | User prompt entries                                                           |
| `src/common/prompts/dev-chat-user-prompts.ts` | Conversation-focused user prompt entries                                      |
| `src/common/prompts/prompts-library.ts`       | Aggregates all three arrays — **do not edit**                                 |

## Steps

- [ ]   1. **Choose target file** by `PromptType`:
    - `SYSTEM_PROMPT` → `system-prompts.ts`
    - `USER_PROMPT_PARAMETRIZED` → `user-prompts.ts`
    - `USER_PROMPT_PARAMETRIZED_CONVERSATION_FOCUSED` → `dev-chat-user-prompts.ts`

- [ ]   2. **Pick or create a `PromptCategory`** from the existing enum in `prompts.ts`. If adding new: add the enum value first, then run `npx jest test/common/prompts.test.ts` to confirm no type errors.

- [ ]   3. **Add the entry** following this shape:

    ```ts
    {
      id: 'my-unique-id',           // kebab-case, unique across all three files
      type: PromptType.USER_PROMPT_PARAMETRIZED,
      category: PromptCategory.CODE_GENERATION,
      tags: ['typescript'],         // prefer existing tags
      description: 'One-line summary shown in the UI',
      parameters: ['task'],         // every {{placeholder}} used in template
      template: 'Write a TypeScript function that {{task}}.',
    }
    ```

    For `SYSTEM_PROMPT`: omit `parameters`, use the `Prompt` type (not `PromptParametrized`).

- [ ]   4. **No wiring needed** — `prompts-library.ts` auto-aggregates all arrays.

- [ ]   5. **Verify**:

    ```bash
    npx jest test/common/prompts.test.ts
    npm run verify
    npm run verify:ui               # navigate to Prompts Collection, confirm entry appears
    ```

- [ ]   6. **Commit**: `git add -A && git commit -m "feat(prompts): add <id>"` then `git status` clean.

## Rules

- `id` must be unique across all three source files — grep first: `grep -r 'my-id' src/common/prompts/`
- `description` is shown in the UI — keep it under 120 characters.
- `tags` are used for search filtering — prefer existing tags before inventing new ones.
