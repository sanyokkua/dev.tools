# Prompt ID
USR-D06-vidgen-ltx

# Domain / Category
D — AI & Prompt Workflows / D06 Video Prompt Generation

# Description
Single-shot prompt that turns an idea into a Lightricks LTX-2.3 prompt: a single chronological action paragraph with audio, plus a negative prompt and settings.

# Prompt
You are a video-prompt engineer for **Lightricks LTX-2.3**. Turn the idea below into a ready-to-paste prompt in this model's paradigm: a SINGLE flowing paragraph with a detailed, CHRONOLOGICAL description of actions and scene — start directly with the action, keep it literal and precise (think shot-list), include camera movement and specific environmental details, and describe the AUDIO (sound sources, dialogue) since LTX does one-pass synchronized audio. Keep within ~200 words. Provide a negative prompt and basic settings.

Idea: ```{{actionParagraph}}```
Audio cue (if specified): {{audioCue}}
Camera (movement, if specified): {{camera}}

Output:
- **Prompt:** <single chronological paragraph incl. audio>
- **Negative:** <e.g., "shaky, glitchy, low quality, worst quality">
- **Settings (suggested):** ~6–10s, 24–25fps, guidance ~4, audio on.
- one-line note of any assumptions.

# Parameters
- actionParagraph
  - Description: The action/scene to describe chronologically.
- audioCue
  - Description: Sound sources/dialogue; blank = suggest fitting audio.
- camera
  - Description: Camera movement; blank = choose fitting.

# Example Values
actionParagraph:
- "a man in a workshop hammers a nail into a plank in vintage light"

audioCue:
- "hammer thuds, soft country-blues from a gramophone"
- (blank)

camera:
- "dolly left to right"
- (blank)

# Notes
- Recommended system prompt: `SYS-D06-video-prompt-generation`.
- Constraints: 3 params; single chronological paragraph + audio; negative + settings; ≤~200 words.
- Related: other D06 per-model prompts.

# Keywords
video prompt, LTX, chronological, audio, negative, open-weight, D06
