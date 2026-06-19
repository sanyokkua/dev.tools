# Prompt ID
USR-D06-vidgen-luma

# Domain / Category
D — AI & Prompt Workflows / D06 Video Prompt Generation

# Description
Single-shot prompt that turns an idea into a Luma Ray3 prompt using natural cinematic language, with optional keyframe guidance.

# Prompt
You are a video-prompt engineer for **Luma Ray3 (Dream Machine)**. Turn the idea below into a ready-to-paste prompt in this model's paradigm: descriptive natural-language with cinematic terms (shot size, camera move, lens, lighting, mood). Be richly descriptive (textures, light) to engage the model's reasoning. If keyframes are provided, describe the transition between start and end frame; for pure image animation, focus on the motion. Keep one dominant action.

Idea: ```{{idea}}```
Camera (movement/lens, if specified): {{camera}}
Keyframes (start/end description, if any): {{keyframes}}

Output: the Luma prompt (cinematic description), and a one-line note on whether it's framed for text-to-video, image animation, or keyframe interpolation.

# Parameters
- idea
  - Description: The video concept.
- camera
  - Description: Desired camera movement/lens; blank = choose fitting.
- keyframes
  - Description: Start/end frame description for interpolation; blank = none.

# Example Values
idea:
- "a lone hiker on a frost-covered ridge at dawn, breath visible"

camera:
- "slow push-in, anamorphic lens"
- (blank)

keyframes:
- "start: wide establishing; end: close-up on face"
- (blank)

# Notes
- Recommended system prompt: `SYS-D06-video-prompt-generation`.
- Constraints: 3 params; cinematic NL; keyframe-aware; one dominant action.
- Related: other D06 per-model prompts.

# Keywords
video prompt, Luma, Ray3, cinematic, keyframes, HDR, text-to-video, D06
