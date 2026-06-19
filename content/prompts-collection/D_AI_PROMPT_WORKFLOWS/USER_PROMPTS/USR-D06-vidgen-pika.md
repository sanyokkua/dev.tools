# Prompt ID
USR-D06-vidgen-pika

# Domain / Category
D — AI & Prompt Workflows / D06 Video Prompt Generation

# Description
Single-shot prompt that turns an idea into a Pika 2.5 prompt (natural language, sound-effects only), with optional constraints.

# Prompt
You are a video-prompt engineer for **Pika 2.5**. Turn the idea below into a ready-to-paste prompt in this model's paradigm: natural-language describing subject + single action + environment + camera move + style, plus simple constraints (e.g., "smooth motion", "no text"). Note: Pika supports sound EFFECTS only (no dialogue/music). Keep one dominant action; favor short, clean motion.

Idea: ```{{idea}}```
Camera (movement, if specified): {{camera}}
Constraints (if any): {{constraints}}

Output: the Pika prompt (one description with constraints), and a one-line note (mention Pikaframes/Pikascenes if keyframes or reference images are relevant).

# Parameters
- idea
  - Description: The video concept.
- camera
  - Description: Desired camera movement; blank = choose fitting.
- constraints
  - Description: Constraints like "no text, smooth motion"; blank = sensible defaults.

# Example Values
idea:
- "a lone traveler walking through a rainy neon city street at night"

camera:
- "slow push-in"
- (blank)

constraints:
- "smooth motion, no text"
- (blank)

# Notes
- Recommended system prompt: `SYS-D06-video-prompt-generation`.
- Constraints: 3 params; NL + constraints; SFX-only audio; one dominant action.
- Related: other D06 per-model prompts.

# Keywords
video prompt, Pika, natural language, constraints, SFX, text-to-video, D06
