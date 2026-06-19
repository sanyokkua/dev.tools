# Prompt ID
USR-D02-imggen-qwenImage

# Domain / Category
D — AI & Prompt Workflows / D02 Image Prompt Generation

# Description
Single-shot prompt that turns an idea into a text-to-image generation prompt for Qwen-Image, using concise literal instructions plus a negative-prompt field.

# Prompt
You are an image-prompt engineer for **Qwen-Image**. Turn the idea below into a ready-to-paste generation prompt in this model's paradigm: concise, literal positive description PLUS a separate negative prompt. The positive prompt states subject + key details, setting, composition/shot, lighting, and style — literal and specific. The negative prompt lists common artifacts to avoid (e.g., blurry, low quality, distorted, extra limbs, watermark, text) tailored to the subject. If the idea is sparse, make minimal sensible choices and note them. Honor the requested aspect ratio.

Idea: ```{{idea}}```
Aspect ratio: {{aspect}}

Output:
- **Positive:** <the positive prompt>
- **Negative:** <the negative prompt>
- one-line note of any assumptions.

# Parameters
- idea
  - Description: The image concept to generate a prompt for.
- aspect
  - Description: Desired aspect ratio (e.g., 16:9, 1:1).

# Example Values
idea:
- "a portrait of an old fisherman at golden hour"
- "an isometric illustration of a tiny coffee shop"

aspect:
- 1:1
- 9:16

# Notes
- Recommended system prompt: `SYS-D02-image-prompt-generation`.
- Constraints: ≤2 params; positive + negative; literal/concise.
- Related: other D02 per-model prompts; `USR-D02-imggen-stableDiffusion` (also positive+negative).

# Keywords
image prompt, Qwen-Image, positive negative, literal, text-to-image, D02
