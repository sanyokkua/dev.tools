# Prompt ID
USR-D02-imggen-flux2

# Domain / Category
D — AI & Prompt Workflows / D02 Image Prompt Generation

# Description
Single-shot prompt that turns an idea into a text-to-image generation prompt for FLUX.2, using its Subject+Action+Style+Context structure with camera/lens language and no negatives.

# Prompt
You are an image-prompt engineer for **FLUX.2**. Turn the idea below into a ready-to-paste generation prompt in this model's paradigm: a descriptive prompt structured as Subject + Action + Style + Context, using natural camera/lens language (e.g., shot type, lens, depth of field) — NO negative prompts. Be concrete and visual; avoid contradictions and stuffing. If the idea is sparse, make minimal sensible choices and note them. Honor the requested aspect ratio in words.

Idea: ```{{idea}}```
Aspect ratio: {{aspect}}

Output: ONLY the FLUX.2 generation prompt, then a one-line note of any assumptions.

# Parameters
- idea
  - Description: The image concept to generate a prompt for.
- aspect
  - Description: Desired aspect ratio (e.g., 16:9, 3:2).

# Example Values
idea:
- "a vintage motorcycle parked on a wet cobblestone street"
- "a chef plating a dessert in a busy kitchen"

aspect:
- 3:2
- 16:9

# Notes
- Recommended system prompt: `SYS-D02-image-prompt-generation`.
- Constraints: ≤2 params; Subject+Action+Style+Context; camera/lens language; no negatives.
- Related: `USR-D02-imggen-flux2Klein` (short fast variant), other D02 prompts.

# Keywords
image prompt, FLUX.2, subject action style context, camera lens, text-to-image, D02
