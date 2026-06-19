# Prompt ID
USR-D06-vidgen-wanApi

# Domain / Category
D — AI & Prompt Workflows / D06 Video Prompt Generation

# Description
Single-shot prompt that turns an idea into a Wan 2.5/2.6/2.7 (hosted API) prompt: natural-language, multi-shot/timeline-capable, with native audio.

# Prompt
You are a video-prompt engineer for **Wan 2.5/2.6/2.7** (hosted API). Turn the idea below into a ready-to-paste prompt in this model's paradigm: natural-language describing subject + scene + motion + camera, with native audio support (add a sound/voice description). For multi-shot, you may use shot numbers + timestamps (e.g., "Shot 1 [0-3s]: …"). Keep one dominant action per shot. Camera movement is in prose.

Idea: ```{{shotDescription}}```
Camera (movement/shot, if specified): {{camera}}
Audio cue (if any): {{audioCue}}

Output: the Wan API prompt (NL description, optional multi-shot timeline, audio line), and a one-line note (suggest resolution/aspect/duration).

# Parameters
- shotDescription
  - Description: The scene/shot description (single or multi-shot).
- camera
  - Description: Camera movement/shot; blank = choose fitting.
- audioCue
  - Description: Sound/voice description; blank = suggest fitting ambience.

# Example Values
shotDescription:
- "a chef plates a dessert, then looks up and smiles"

camera:
- "slow push-in"
- (blank)

audioCue:
- "kitchen ambience, soft jazz"
- (blank)

# Notes
- Recommended system prompt: `SYS-D06-video-prompt-generation`.
- Constraints: 3 params; NL + native audio; optional multi-shot timeline.
- Related: `USR-D06-vidgen-wanLocal` (open-weight, positive+negative); other D06 prompts.

# Keywords
video prompt, Wan API, natural language, native audio, multi-shot, D06
