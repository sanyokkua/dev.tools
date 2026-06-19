# Prompt ID
USR-D06-vidgen-hunyuan

# Domain / Category
D — AI & Prompt Workflows / D06 Video Prompt Generation

# Description
Single-shot prompt that turns an idea into a Tencent HunyuanVideo 1.5 prompt using its structured positive formula (long, detailed; rewrite-LLM friendly), with optional negative.

# Prompt
You are a video-prompt engineer for **Tencent HunyuanVideo 1.5** (open-source). Turn the idea below into a ready-to-paste prompt in this model's paradigm: a structured, DETAILED positive prompt following Hunyuan's formula — Subject + Motion + Scene + [Shot type] + [Camera movement] + [Lighting] + [Style] + [Atmosphere]. Hunyuan rewards longer, more detailed prompts. Decompose complex motion into a temporal action sequence. Optionally provide a negative prompt. On-screen text goes in quotes.

Idea: ```{{subjectMotionScene}}```
Camera & lighting (if specified): {{cameraLighting}}
Style (if specified): {{style}}

Output:
- **Prompt:** <detailed structured Hunyuan positive prompt>
- **Negative (optional):** <artifacts to avoid>
- **Settings (suggested):** ~720p, ~5s; keep prompt-rewrite enabled if available.
- one-line note of any assumptions.

# Parameters
- subjectMotionScene
  - Description: Subject + motion + scene (the core).
- cameraLighting
  - Description: Camera movement + lighting; blank = choose fitting.
- style
  - Description: Visual style/medium; blank = choose fitting.

# Example Values
subjectMotionScene:
- "an elderly fisherman mends a net on a weathered dock; he works slowly, hands deliberate; calm water"

cameraLighting:
- "wide shot, slow push-in; warm side-light, long soft shadows"
- (blank)

style:
- "photorealistic, cinematic"
- (blank)

# Notes
- Recommended system prompt: `SYS-D06-video-prompt-generation`.
- Constraints: 3 params; detailed structured positive + optional negative; decompose complex motion.
- Related: other D06 per-model prompts.

# Keywords
video prompt, HunyuanVideo, structured, detailed, open-source, D06
