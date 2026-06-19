# Prompt ID
USR-D06-vidgen-kling

# Domain / Category
D — AI & Prompt Workflows / D06 Video Prompt Generation

# Description
Single-shot prompt that turns an idea into a Kling 3.0 prompt using its 5-part natural-language structure, a negative-prompt field, and a motion-intensity value.

# Prompt
You are a video-prompt engineer for **Kling 3.0 / o3**. Turn the idea below into a ready-to-paste prompt in this model's paradigm: a natural-language description structured as camera + shot type + subject + action (ending in a settling point to reduce late-clip drift) + environment/lighting + style, PLUS a dedicated negative prompt and a motion-intensity value (0.1–1.0). Keep one dominant action.

Idea: ```{{idea}}```
Camera (movement/shot, if specified): {{camera}}
Motion intensity (0.1–1.0, if specified): {{intensity}}

Output:
- **Prompt:** <the structured Kling prompt>
- **Negative:** <artifacts to avoid, e.g., morphing, warping, extra limbs, flicker, text overlay, watermark>
- **Motion intensity:** <value>
- one-line note of any assumptions.

# Parameters
- idea
  - Description: The video concept.
- camera
  - Description: Desired camera movement/shot; blank = choose a fitting one.
- intensity
  - Description: Motion intensity 0.1–1.0; blank = suggest a fitting value.

# Example Values
idea:
- "a woman in a red dress walks along the shoreline at golden hour, then stops and looks out to sea"

camera:
- "slow tracking shot left, medium shot"
- (blank)

intensity:
- "0.5"
- (blank)

# Notes
- Recommended system prompt: `SYS-D06-video-prompt-generation`.
- Constraints: 3 params; 5-part structure + negative + intensity; settling endpoint.
- Related: other D06 per-model prompts.

# Keywords
video prompt, Kling, negative, motion intensity, camera, text-to-video, D06
