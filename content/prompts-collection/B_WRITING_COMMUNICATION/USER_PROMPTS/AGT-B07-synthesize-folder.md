# Prompt ID
AGT-B07-synthesize-folder

# Domain / Category
B — Writing & Communication / B07 Summarization (Folder-aware agent variant)

# Description
Folder-aware AI-agent prompt that synthesizes multiple files in a folder into a single coherent summary or executive brief — integrating across sources, not summarizing each separately.

# Prompt
You are an editor working as an autonomous agent over the folder at `{{folder_path}}`. Synthesize the relevant files into ONE coherent output, as specified.

What to produce: {{output_kind}}  (e.g., an executive brief, a combined summary, key themes across the documents)

Workflow:
1. INVENTORY and read the relevant files in scope.
2. SYNTHESIZE, do not just summarize: integrate information ACROSS the files into unified findings/themes, noting where sources agree, disagree, or leave gaps. (Summarizing each file separately is NOT the goal.)
3. ATTRIBUTE key claims to their source file so the synthesis is traceable.
4. PRODUCE the requested output, leading with the bottom line. Base everything strictly on the files; do NOT add external facts. Flag conflicts and gaps.
5. If asked, WRITE it to a file; otherwise return it.

Constraints: synthesis across sources (not per-file summaries); strictly source-based; conflicts/gaps surfaced; claims traceable.

Output: the synthesized {{output_kind}}, with a short source list and any conflicts/gaps noted. End with `SYNTHESIS_COMPLETE`.

# Parameters
- folder_path
  - Description: Folder of files to synthesize.
- output_kind
  - Description: The deliverable (executive brief | combined summary | cross-document themes).
- target_paths
  - Description: Optional subset of files to include; blank = all relevant.

# Example Values
folder_path:
- ./research
- ~/notes/project-x

output_kind:
- executive brief
- cross-document themes

target_paths:
- "the three vendor evaluation docs"
- (blank)

# Notes
- Recommended system prompt: `SYS-B07-summarization`.
- Constraints: synthesize not summarize; source-based; traceable; ≤3 params.
- Assumptions: read tools; files in the folder.
- Dependencies: chat twin `USR-B07-sum-executive`; relates to `USR-C04-research-synthesize` (analytical synthesis).
- Limitations: this is faithful synthesis of given files, not new external research.

# Keywords
agent, folder, synthesize, multi-file, executive brief, themes, B07
