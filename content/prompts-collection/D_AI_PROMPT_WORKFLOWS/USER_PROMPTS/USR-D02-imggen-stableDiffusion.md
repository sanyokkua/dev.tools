# Prompt ID
USR-D02-imggen-stableDiffusion

# Domain / Category
D — AI & Prompt Workflows / D02 Image Prompt Generation

# Description
Single-shot prompt that turns an idea into a Stable Diffusion (SDXL/SD 3.5) generation prompt: positive + negative prompts plus suggested CFG/sampler settings.

# Prompt
You are an image-prompt engineer for **Stable Diffusion (SDXL / SD 3.5)**. Turn the idea below into a ready-to-paste prompt set in this model's paradigm: a positive prompt (comma-grouped descriptive tags/phrases — subject, details, setting, composition, lighting, style, quality), a negative prompt (artifacts to avoid), and suggested settings (CFG scale, sampler/steps as a starting point). If the idea is sparse, make minimal sensible choices and note them. Honor the requested aspect ratio (as dimensions/ratio).

Idea: ```{{idea}}```
Aspect ratio: {{aspect}}

Output:
- **Positive:** <comma-grouped positive prompt>
- **Negative:** <negative prompt>
- **Settings:** CFG, sampler, steps (suggested starting values)
- one-line note of any assumptions.

# Parameters
- idea
  - Description: The image concept to generate a prompt for.
- aspect
  - Description: Desired aspect ratio (e.g., 16:9, 1:1).

# Example Values
idea:
- "a fantasy castle on a floating island at sunrise"
- "a studio photo of a leather backpack"

aspect:
- 16:9
- 1:1

# Notes
- Recommended system prompt: `SYS-D02-image-prompt-generation`.
- Constraints: ≤2 params; positive + negative + settings; comma-grouped tags.
- Related: `USR-D02-imggen-qwenImage` (also positive+negative); settings are starting points to tune.

# Keywords
image prompt, Stable Diffusion, SDXL, SD3.5, positive negative, CFG, sampler, D02
