# Prompt ID
USR-D02-imggen-joyai

# Domain / Category
D — AI & Prompt Workflows / D02 Image Prompt Generation

# Description
Single-shot prompt that turns an idea into a JoyAI generation prompt: imperative instructions plus a negative field and settings.

# Prompt
You are an image-prompt engineer for **JoyAI**. Turn the idea below into a ready-to-paste generation prompt in this model's paradigm: clear imperative instructions describing the desired image (subject + details, setting, composition, lighting, style), PLUS a separate negative prompt and any basic settings the workflow expects. Be literal and specific. If the idea is sparse, make minimal sensible choices and note them. Honor the requested aspect ratio.

Idea: ```{{idea}}```
Aspect ratio: {{aspect}}

Output:
- **Prompt:** <imperative positive prompt>
- **Negative:** <negative prompt>
- **Settings:** <basic settings, if applicable>
- one-line note of any assumptions.

# Parameters
- idea
  - Description: The image concept to generate a prompt for.
- aspect
  - Description: Desired aspect ratio (e.g., 1:1, 16:9).

# Example Values
idea:
- "a serene Japanese garden with a koi pond"
- "a cyberpunk character portrait"

aspect:
- 1:1
- 9:16

# Notes
- Recommended system prompt: `SYS-D02-image-prompt-generation`.
- Constraints: ≤2 params; imperative + negative + settings.
- Related: other D02 per-model prompts.

# Keywords
image prompt, JoyAI, imperative, negative, settings, text-to-image, D02
