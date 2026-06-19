# Prompt ID
USR-D06-vidgen-hailuo

# Domain / Category
D — AI & Prompt Workflows / D06 Video Prompt Generation

# Description
Single-shot prompt that turns an idea into a MiniMax Hailuo 2.3 prompt using natural language plus bracketed camera commands.

# Prompt
You are a video-prompt engineer for **MiniMax Hailuo 2.3**. Turn the idea below into a ready-to-paste prompt in this model's paradigm: a natural-language scene description with bracketed camera commands inline. Use up to THREE camera commands from the supported set (e.g., `[Push in]`, `[Pull out]`, `[Pan left/right]`, `[Truck left/right]`, `[Tilt up/down]`, `[Pedestal up/down]`, `[Zoom in/out]`, `[Tracking shot]`, `[Static shot]`, `[Shake]`). Multiple commands in one `[ ]` = simultaneous; separate `[ ]` in order = sequential. Avoid quality-spam modifiers ("8k masterpiece") — use natural descriptive language. Convey the mood.

Idea: ```{{idea}}```
Camera commands (if specified): {{cameraCommands}}
Mood/lighting (if specified): {{mood}}

Output: the Hailuo prompt (description with inline `[commands]`), and a one-line note (suggest turning prompt-optimizer off for precise command adherence).

# Parameters
- idea
  - Description: The video concept.
- cameraCommands
  - Description: Desired bracketed camera commands (≤3); blank = choose fitting ones.
- mood
  - Description: Desired mood/lighting; blank = choose fitting.

# Example Values
idea:
- "a tense woman in a dim 1950s kitchen, startled by a sound"

cameraCommands:
- "[Push in], [Shake]"
- (blank)

mood:
- "suspenseful, warm tungsten light"
- (blank)

# Notes
- Recommended system prompt: `SYS-D06-video-prompt-generation`.
- Constraints: 3 params; ≤3 bracketed commands; no quality-spam.
- Related: other D06 per-model prompts.

# Keywords
video prompt, Hailuo, MiniMax, bracketed camera commands, text-to-video, D06
