---
name: add-prompt
description: Add a prompt or skill to the dev.tools prompts collection
---

# Add a Prompt (or Skill)

Prompt data lives in `content/prompts-collection/`. Adding a prompt means creating a Markdown file — no TypeScript editing required. After creating the file, run `npm run ingest:prompts` to regenerate the JSON that the UI reads at runtime.

## Directory layout

```
content/prompts-collection/
  A_SOFTWARE_ENGINEERING/
    SYSTEM_PROMPTS/          ← SYS-A* files
    USER_PROMPTS/            ← USR-A* and AGT-A* files
    SKILLS/<slug>/SKILL.md
  B_WRITING_COMMUNICATION/
    SYSTEM_PROMPTS/
    USER_PROMPTS/
  C_THINKING_PRODUCTIVITY/
    SYSTEM_PROMPTS/
    USER_PROMPTS/
  D_AI_PROMPT_WORKFLOWS/
    SYSTEM_PROMPTS/
    USER_PROMPTS/
    SKILLS/<slug>/SKILL.md
```

Domain code is the prefix letter of the directory name: `A`, `B`, `C`, `D`.

---

## Prompt file format (8 sections, fixed order)

Only `# Prompt ID` is strictly required. All other sections default to empty if omitted.

```markdown
# Prompt ID

USR-A01-my-slug

# Domain / Category

Software Engineering / A01 Code Generation

# Description

One-line summary shown in the UI.

# Prompt

The prompt template text. Use {{param_name}} for placeholders.

# Parameters

- param_name
    - Description: What this parameter represents.
- second_param
    - Description: A second parameter.

# Example Values

param_name:

- "First example value"
- "Second example value"
  second_param:
- "Example"

# Notes

Recommended system prompt: `SYS-A01-code-generation`
Related: `USR-A03-review-change` `SKILL-aws-expert`

# Keywords

keyword1, keyword2, keyword3
```

---

## Naming conventions

| Type               | ID prefix           | File location     | Filename example       |
| ------------------ | ------------------- | ----------------- | ---------------------- |
| User prompt (chat) | `USR-<code>-<slug>` | `USER_PROMPTS/`   | `USR-A01-implement.md` |
| Agent variant      | `AGT-<code>-<slug>` | `USER_PROMPTS/`   | `AGT-A01-implement.md` |
| System prompt      | `SYS-<code>-<slug>` | `SYSTEM_PROMPTS/` | `SYS-A01-code-gen.md`  |

- `<code>` = domain letter + two-digit category number (e.g. `A01`, `B03`, `D06`).
- `<slug>` = kebab-case, starts with a letter (e.g. `implement`, `review-change`).
- Full ID pattern: `^(?:SYS|USR|AGT)-[A-Z]\d+-[a-zA-Z][\w-]*$`
- Filename = ID + `.md`.

Category codes are listed in `content/prompts-collection/INDEX.md` (Inventory section) and `BUILD_STATE.md` §2.

---

## Domain reference

| Code | Title                   | UI slug                 |
| ---- | ----------------------- | ----------------------- |
| A    | Software Engineering    | `software-engineering`  |
| B    | Writing & Communication | `writing-communication` |
| C    | Thinking & Productivity | `thinking-productivity` |
| D    | AI & Prompt Workflows   | `ai-prompt-workflows`   |

---

## Steps: adding a user or agent prompt

- [ ]   1. **Pick domain and category.** Consult `content/prompts-collection/INDEX.md` (Inventory table) or `BUILD_STATE.md §2` for existing category codes. System prompts (`SYS-*`) should already exist for the category you choose.

- [ ]   2. **Create the file** in `USER_PROMPTS/`:

    ```bash
    touch content/prompts-collection/A_SOFTWARE_ENGINEERING/USER_PROMPTS/USR-A01-my-slug.md
    ```

- [ ]   3. **Fill in the 8 sections** following the format above. Key rules:
    - `# Prompt ID` — must be globally unique across all files. Check first:
        ```bash
        grep -r "USR-A01-my-slug" content/
        ```
    - `# Domain / Category` — format: `<Domain Title> / <CODE> <Category Title>`. Only the part after `/` is parsed by the ingester for the category title.
    - `# Parameters` — hard cap: **≤ 3 parameters**. Write `None` if the prompt takes no parameters.
    - `# Example Values` — list values per param name, or `N/A` if none.
    - `# Notes` — `Recommended system prompt: \`SYS-A01-slug\``must reference an existing system prompt ID (fails ingestion if it doesn't).`Related:` references are advisory and silently dropped if unresolved.
    - `# Keywords` — comma-separated list used for search.

- [ ]   4. **Regenerate JSON**:

    ```bash
    npm run ingest:prompts
    ```

    Expected: `✓ Ingested: System prompts: N | User/agent prompts: N | Logical groups: N | Skills: N`

- [ ]   5. **Verify in the UI**:

    ```bash
    npm run verify:ui    # navigate to /prompts-collection, confirm the prompt appears
    ```

- [ ]   6. **Commit**:

    ```bash
    git add -A && git commit -m "feat(prompts): add USR-A01-my-slug"
    git status   # must be clean
    ```

---

## Steps: adding a system prompt

Same as above, but:

- File goes in `SYSTEM_PROMPTS/`, not `USER_PROMPTS/`
- Use `SYS-` prefix
- Write `None` for `# Parameters` — system prompts take no parameters
- This system prompt becomes the `recommendedSystemPromptId` for its category

---

## Steps: adding a skill

Skills live under `SKILLS/<slug>/SKILL.md` with a YAML frontmatter header.

- [ ]   1. **Create the folder and file**:

    ```bash
    mkdir -p content/prompts-collection/A_SOFTWARE_ENGINEERING/SKILLS/my-skill
    touch content/prompts-collection/A_SOFTWARE_ENGINEERING/SKILLS/my-skill/SKILL.md
    ```

- [ ]   2. **Write SKILL.md** with YAML frontmatter then a Markdown body:

    ```markdown
    ---
    name: My Skill Title
    version: 1.0.0
    description: One-line description shown in the UI.
    tags: [tag1, tag2]
    allowed-tools: [Bash, Read, Write]
    references: []
    related-skills: []
    ---

    ## Overview

    Describe what this skill does and when to trigger it.

    ## Steps

    1. ...
    ```

    Frontmatter fields:
    - `name`: display title
    - `allowed-tools`: comma-separated string or JSON array
    - `related-skills`: array of `slug: Description` entries
    - `id` is auto-derived as `SKILL-<folder-slug>` — do not add it manually

- [ ]   3. **Regenerate and verify**:

    ```bash
    npm run ingest:prompts
    npm run verify:ui
    ```

---

## Validation errors and fixes

| Error message                                                     | Cause                                                            | Fix                                                        |
| ----------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| `No prompt ID in <file>`                                          | `# Prompt ID` section missing or empty                           | Add it as the very first section                           |
| `Unknown prompt ID prefix: <id>`                                  | Doesn't start with `SYS-`, `USR-`, or `AGT-`                     | Correct the prefix                                         |
| `Cannot derive category from ID: <id>`                            | ID format wrong (e.g. missing category number)                   | Fix to `USR-A01-slug` format                               |
| `Dangling recommendedSystemPromptId: <sys-id> in <usr-id>`        | `# Notes` references a SYS prompt that doesn't exist             | Fix the SYS ID or add the missing system prompt file       |
| `INDEX system count mismatch` / `INDEX user/agent count mismatch` | `INDEX.md` inventory table count doesn't match actual file count | Update the counts in `content/prompts-collection/INDEX.md` |
| `defaultVariantId not found: <lp-id>`                             | A logical prompt's default variant was removed                   | Re-add the variant or fix the grouping slug                |
