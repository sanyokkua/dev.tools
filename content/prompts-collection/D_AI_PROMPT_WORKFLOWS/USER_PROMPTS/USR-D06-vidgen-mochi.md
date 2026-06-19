# Prompt ID
USR-D06-vidgen-mochi

# Domain / Category
D — AI & Prompt Workflows / D06 Video Prompt Generation

# Description
Single-shot prompt that turns an idea into a Genmo Mochi 1 prompt: a descriptive positive prompt plus a negative prompt (open-source, text-to-video only, 480p).

# Prompt
You are a video-prompt engineer for **Genmo Mochi 1** (open-source, text-to-video only). Turn the idea below into a ready-to-paste prompt in this model's paradigm: a descriptive positive prompt (subject + action + scene + camera + lighting + style) emphasizing clear motion, plus a separate negative prompt. Note: Mochi is T2V only (no image conditioning, no audio) and outputs ~480p — keep expectations and detail appropriate. One coherent action.

Idea: ```{{caption}}```
Camera (movement, if specified): {{camera}}
Negative (if specified): {{negative}}

Output:
- **Prompt:** <descriptive positive prompt>
- **Negative:** <artifacts to avoid; use the provided one or a sensible default>
- one-line note of any assumptions (and a reminder it's T2V-only, 480p).

# Parameters
- caption
  - Description: The video concept to describe.
- camera
  - Description: Camera movement; blank = choose fitting.
- negative
  - Description: Negative prompt; blank = sensible default.

# Example Values
caption:
- "a hummingbird hovers at a bright red flower in a sunlit garden"

camera:
- "static shot, shallow depth of field"
- (blank)

negative:
- "blurry, low quality, distorted, flicker"
- (blank)

# Notes
- Recommended system prompt: `SYS-D06-video-prompt-generation`.
- Constraints: 3 params; positive + negative; T2V-only, 480p; clear motion.
- Related: `USR-D06-vidgen-cogvideox` (also open-source).

# Keywords
video prompt, Mochi, Genmo, positive negative, open-source, T2V, D06
