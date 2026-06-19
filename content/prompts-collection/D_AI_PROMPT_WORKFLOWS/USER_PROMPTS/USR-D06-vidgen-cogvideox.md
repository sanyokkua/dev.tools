# Prompt ID
USR-D06-vidgen-cogvideox

# Domain / Category
D — AI & Prompt Workflows / D06 Video Prompt Generation

# Description
Single-shot prompt that turns an idea into a CogVideoX-1.5 prompt: a long descriptive positive caption plus a negative prompt (open-source, diffusers).

# Prompt
You are a video-prompt engineer for **CogVideoX-1.5** (open-source). Turn the idea below into a ready-to-paste prompt in this model's paradigm: a LONG, descriptive positive caption (subject + detailed action + scene + camera + lighting + style) — CogVideoX rewards long captions — plus a separate negative prompt. Keep the English caption within ~226 tokens. Keep one coherent action.

Idea: ```{{caption}}```
Camera (movement, if specified): {{camera}}
Negative (if specified): {{negative}}

Output:
- **Prompt:** <long descriptive positive caption>
- **Negative:** <artifacts to avoid; use the provided one or a sensible default>
- **Settings (suggested):** ~6–10s, 8fps, 720×480 (1.5).
- one-line note of any assumptions.

# Parameters
- caption
  - Description: The video concept / scene to caption in detail.
- camera
  - Description: Camera movement; blank = choose fitting.
- negative
  - Description: Negative prompt; blank = sensible default.

# Example Values
caption:
- "a paper boat drifts down a rain-filled gutter past autumn leaves"

camera:
- "slow tracking shot"
- (blank)

negative:
- "blurry, low quality, distorted, flicker"
- (blank)

# Notes
- Recommended system prompt: `SYS-D06-video-prompt-generation`.
- Constraints: 3 params; long caption + negative; ~226-token cap; low-res/short.
- Related: `USR-D06-vidgen-mochi` (also open-source, positive+negative).

# Keywords
video prompt, CogVideoX, long caption, negative, open-source, D06
