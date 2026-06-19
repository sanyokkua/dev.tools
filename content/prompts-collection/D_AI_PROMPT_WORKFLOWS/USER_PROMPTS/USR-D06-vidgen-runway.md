# Prompt ID
USR-D06-vidgen-runway

# Domain / Category
D — AI & Prompt Workflows / D06 Video Prompt Generation

# Description
Single-shot prompt that turns an idea into a motion-focused, positive-only text/image-to-video prompt for Runway Gen-4.5.

# Prompt
You are a video-prompt engineer for **Runway Gen-4.5**. Turn the idea below into a ready-to-paste prompt in this model's paradigm: natural-language and MOTION-focused, **positive phrasing only — Runway does NOT support negatives** (never write "no X"; phrase positively, e.g., "a static locked-off shot"). Describe one primary motion, the camera move, then secondary/background motion, then style/pacing. If this will be image-to-video, describe ONLY motion + camera (the image fixes subject/scene).

Idea: ```{{idea}}```
Camera (movement, if specified): {{camera}}

Output: the Runway prompt (one flowing description), plus a one-line note on whether it's framed for text-to-video or image-to-video.

# Parameters
- idea
  - Description: The video concept (or the motion desired for an input image).
- camera
  - Description: Desired camera movement; blank = choose a fitting one.

# Example Values
idea:
- "the woman's hair moves gently in the wind as she turns to look at the camera"

camera:
- "slow push-in"
- (blank)

# Notes
- Recommended system prompt: `SYS-D06-video-prompt-generation`.
- Constraints: ≤2 params; positive-only (NO negatives); motion-focused; i2v = motion+camera only.
- Related: other D06 per-model prompts.

# Keywords
video prompt, Runway, Gen-4.5, motion, positive-only, no negatives, D06
