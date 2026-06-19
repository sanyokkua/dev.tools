# Prompt ID
USR-D06-vidgen-wanLocal

# Domain / Category
D — AI & Prompt Workflows / D06 Video Prompt Generation

# Description
Single-shot prompt that turns an idea into a Wan 2.2 (open-weight, local/ComfyUI) prompt: structured positive + negative, with numeric-setting guidance.

# Prompt
You are a video-prompt engineer for **Wan 2.2** (open-weight, local/ComfyUI). Turn the idea below into a ready-to-paste prompt in this model's paradigm: a structured positive prompt PLUS a separate negative prompt. Positive follows Wan's recipe: Subject (description) + Scene (description) + Motion (with speed adverb) + aesthetic control (light source, shot size, camera angle/movement) + style. Negative uses the standard artifact list. Keep one scene/clip (~5s). Use in-prose camera terms ("dolly in", "static shot").

Idea: ```{{subjectAction}}```
Scene & style (if specified): {{sceneStyle}}
Camera (movement/shot, if specified): {{camera}}

Output:
- **Positive:** <structured Wan positive prompt>
- **Negative:** <artifact list, e.g., "blurred, low quality, deformed, extra fingers, watermark, subtitles, static, overexposed, …">
- **Settings (suggested):** guidance ~5–7, steps ~20–30, ~5s.
- one-line note of any assumptions.

# Parameters
- subjectAction
  - Description: Subject + the motion/action.
- sceneStyle
  - Description: Scene/setting and visual style; blank = choose fitting.
- camera
  - Description: Camera movement/shot; blank = choose fitting.

# Example Values
subjectAction:
- "a Miao girl walks slowly through a misty bamboo forest at dawn"

sceneStyle:
- "soft golden side-light, cinematic, shallow depth of field"
- (blank)

camera:
- "slow dolly-in following her"
- (blank)

# Notes
- Recommended system prompt: `SYS-D06-video-prompt-generation`.
- Constraints: 3 params; positive + negative + settings; ~5s single scene.
- Related: `USR-D06-vidgen-wanApi` (hosted, NL + audio); other D06 prompts.

# Keywords
video prompt, Wan 2.2, open-weight, positive negative, ComfyUI, settings, D06
