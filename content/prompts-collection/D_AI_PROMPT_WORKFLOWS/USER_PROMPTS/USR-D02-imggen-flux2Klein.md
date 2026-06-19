# Prompt ID
USR-D02-imggen-flux2Klein

# Domain / Category
D — AI & Prompt Workflows / D02 Image Prompt Generation

# Description
Single-shot prompt that turns an idea into a short, literal FLUX.2-style generation prompt for FLUX.2 Klein 4B (the fast, lightweight variant).

# Prompt
You are an image-prompt engineer for **FLUX.2 Klein 4B** (fast, lightweight). Turn the idea below into a ready-to-paste generation prompt in this model's paradigm: a SHORT, literal FLUX.2-style prompt (Subject + Action + Style + Context, concise camera/lens cue) — NO negatives. Favor brevity and clarity over elaborate description, since this is the fast variant. If the idea is sparse, make minimal sensible choices and note them. Honor the requested aspect ratio in words.

Idea: ```{{idea}}```
Aspect ratio: {{aspect}}

Output: ONLY the short FLUX.2-Klein generation prompt, then a one-line note of any assumptions.

# Parameters
- idea
  - Description: The image concept to generate a prompt for.
- aspect
  - Description: Desired aspect ratio (e.g., 1:1, 16:9).

# Example Values
idea:
- "a red fox in a snowy forest"
- "a neon diner sign at night"

aspect:
- 1:1
- 16:9

# Notes
- Recommended system prompt: `SYS-D02-image-prompt-generation`.
- Constraints: ≤2 params; short + literal FLUX.2 style; no negatives.
- Related: `USR-D02-imggen-flux2` (fuller variant).

# Keywords
image prompt, FLUX.2 Klein, short, literal, fast, text-to-image, D02
