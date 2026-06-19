# Prompt ID
USR-D02-imggen-geminiNanoBananaPro

# Domain / Category
D — AI & Prompt Workflows / D02 Image Prompt Generation

# Description
Single-shot prompt that turns an idea into a text-to-image generation prompt for Google Gemini 3 Pro Image (Nano Banana Pro), using its natural-language-brief paradigm.

# Prompt
You are an image-prompt engineer for **Gemini 3 Pro Image (Nano Banana Pro)**. Turn the idea below into a single, ready-to-paste generation prompt in this model's paradigm: a natural-language descriptive brief — NO negative prompts, NO weights, NO parameter syntax. Write it as a flowing cinematic description covering subject + key details, setting, composition/shot, lighting, style/medium, and mood. Be concrete; avoid contradictions and keyword-stuffing. If the idea is sparse, make minimal sensible choices and note them briefly. Honor the requested aspect ratio in words.

Idea: ```{{idea}}```
Aspect ratio: {{aspect}}

Output: ONLY the natural-language image prompt (one paragraph), then a one-line note of any assumptions.

# Parameters
- idea
  - Description: The image concept to generate a prompt for.
- aspect
  - Description: Desired aspect ratio (e.g., 16:9, 9:16, 1:1).

# Example Values
idea:
- "a cozy reading nook by a rainy window at dusk"
- "a futuristic city street market"

aspect:
- 16:9
- 9:16

# Notes
- Recommended system prompt: `SYS-D02-image-prompt-generation`.
- Constraints: ≤2 params; natural-language brief; no negatives/weights/params.
- Related: other D02 per-model prompts; for editing an image see D03.

# Keywords
image prompt, Gemini, Nano Banana Pro, natural language, text-to-image, D02
