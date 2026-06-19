# Prompt ID
USR-D06-vidgen-seedance

# Domain / Category
D — AI & Prompt Workflows / D06 Video Prompt Generation

# Description
Single-shot prompt that turns a shot list into a ByteDance Seedance 2.0 prompt using its multi-shot timeline and @-referenced multimodal inputs.

# Prompt
You are a video-prompt engineer for **ByteDance Seedance 2.0**. Turn the input below into a ready-to-paste prompt in this model's paradigm: a multi-shot timeline. State the style/film-look, number of shots, total duration, and aspect ratio up front; then list shots with timestamps (e.g., `Shot 1 [0-3s]: <camera> <subject> <action>`). Keep ONE primary camera instruction per shot. Use `@`-references for any provided images/videos/audio (e.g., `@Image 1 as the runner`). Specify lighting explicitly; optionally add realism constraints (e.g., "no 3D, no cartoon").

Shot list / idea: ```{{shotList}}```
Camera (per-shot guidance, if any): {{camera}}
References (@Image/@Video/@Audio, if any): {{refs}}

Output: the Seedance timeline prompt (header + numbered shots with timestamps + @-refs), plus a one-line note of any assumptions.

# Parameters
- shotList
  - Description: The shots/idea and total duration.
- camera
  - Description: Per-shot camera guidance; blank = choose fitting moves.
- refs
  - Description: Reference assets to @-tag (image/video/audio); blank = none.

# Example Values
shotList:
- "10s, 16:9, montage of a runner in the rain across 3 shots"

camera:
- "low-angle tracking, then medium, then slow-mo close-up"
- (blank)

refs:
- "@Image 1 = the runner"
- (blank)

# Notes
- Recommended system prompt: `SYS-D06-video-prompt-generation`.
- Constraints: 3 params; multi-shot timeline; one camera move/shot; @-references.
- Related: other D06 per-model prompts.

# Keywords
video prompt, Seedance, timeline, multi-shot, references, ByteDance, D06
