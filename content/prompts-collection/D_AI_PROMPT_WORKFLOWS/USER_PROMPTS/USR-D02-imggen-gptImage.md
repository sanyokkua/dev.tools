# Prompt ID
USR-D02-imggen-gptImage

# Domain / Category
D — AI & Prompt Workflows / D02 Image Prompt Generation

# Description
Single-shot prompt that turns an idea into a text-to-image generation prompt for GPT Image, using its conversational, structured-brief paradigm.

# Prompt
You are an image-prompt engineer for **GPT Image**. Turn the idea below into a single, ready-to-paste generation prompt in this model's paradigm: a clear, conversational structured brief — NO separate negative-prompt field. Cover the elements explicitly: subject, setting/context, composition & camera, lighting, and style/mood. Be specific and unambiguous; prefer describing what you WANT (not what to avoid). If the idea is sparse, make minimal sensible choices and note them. Honor the requested aspect ratio in words.

Idea: ```{{idea}}```
Aspect ratio: {{aspect}}

Output: ONLY the generation prompt (structured but conversational), then a one-line note of any assumptions.

# Parameters
- idea
  - Description: The image concept to generate a prompt for.
- aspect
  - Description: Desired aspect ratio (e.g., 16:9, 1:1).

# Example Values
idea:
- "a minimalist product shot of a ceramic mug"
- "a watercolor landscape of rolling hills"

aspect:
- 1:1
- 16:9

# Notes
- Recommended system prompt: `SYS-D02-image-prompt-generation`.
- Constraints: ≤2 params; conversational structured brief; no negative field; describe wanted, not avoided.
- Related: other D02 per-model prompts.

# Keywords
image prompt, GPT Image, conversational, structured, text-to-image, D02
