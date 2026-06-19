# Prompt ID
AGT-B01-editpass-folder

# Domain / Category
B — Writing & Communication / B01 Proofreading (Folder-aware agent variant)

# Description
Folder-aware AI-agent prompt that performs a proofreading and consistency pass across a folder of documents, applying corrections in place and reporting changes.

# Prompt
You are a copy editor working as an autonomous agent over the folder at `{{folder_path}}`. Perform a proofreading and consistency pass across the documents there.

Scope (optional — file types or subset): {{target_paths}}

Workflow:
1. INVENTORY the in-scope documents (e.g., `*.md`, `*.txt`). Read them.
2. PROOFREAD each: fix grammar, spelling, punctuation, and obvious errors with minimal changes — preserve meaning and tone.
3. ENFORCE CROSS-FILE CONSISTENCY: detect inconsistent terminology, naming, capitalization, and formatting ACROSS the documents (e.g., "log in" vs "login", product-name spelling) and standardize to the most common/correct form. List the conventions you standardized on.
4. APPLY edits in place to the files (or output a diff if the user prefers). Confirm before large rewrites — this is proofreading, not rewriting.
5. REPORT a per-file summary of changes and the consistency decisions made.

Constraints: minimal, meaning-preserving edits; proofread (not rewrite); standardize consistently; do not change technical facts; back up via the user's VCS (do not commit yourself).

Output: edited files (or diffs) + a report: files touched, types of fixes, consistency conventions applied, anything ambiguous left for the user. End with `EDITPASS_COMPLETE`.

# Parameters
- folder_path
  - Description: Folder of documents to proofread.
- target_paths
  - Description: Optional file-type/subset filter (e.g., `*.md`, `docs/`); blank = all text docs.
- user_intent
  - Description: Optional — "apply edits in place" (default) or "report diffs only".

# Example Values
folder_path:
- ./docs
- ~/handbook

target_paths:
- "*.md"
- (blank)

user_intent:
- "apply in place"
- "diffs only"

# Notes
- Recommended system prompt: `SYS-B01-proofreading`.
- Constraints: minimal edits; cross-file consistency; proofread not rewrite; ≤3 params.
- Assumptions: read/write tools; the user uses version control to review/revert.
- Dependencies: chat twins `USR-B01-*`.
- Limitations: standardizes to a best-guess convention — review the reported choices.

# Keywords
agent, folder, proofread, consistency, edit pass, multi-file, B01
