# Prompt ID
USR-D06-vidgen-veo

# Domain / Category
D — AI & Prompt Workflows / D06 Video Prompt Generation

# Description
Single-shot prompt that turns an idea into a text-to-video prompt for Google Veo 3.1, using its natural-language director's-brief paradigm with native audio.

# Prompt
You are a video-prompt engineer for **Google Veo 3.1**. Turn the idea below into a ready-to-paste prompt in this model's paradigm: a natural-language director's brief covering shot composition + subject details + a single dominant action + setting + lighting/mood, plus an **Audio:** line (ambience/SFX, and one short quoted line of dialogue only if implied). Camera movement goes in prose. Negatives go in a separate `negative_prompt`, NOT in the main prose. Keep one dominant action; add a settling endpoint. Duration/resolution are set as parameters, not prose.

Idea: ```{{idea}}```
Camera (movement/shot, if specified): {{camera}}
Audio cue (if any): {{audioCue}}

Output: the Veo prompt (prose brief + Audio line), a suggested `negative_prompt`, and a one-line note (suggested duration/aspect).

# Parameters
- idea
  - Description: The video concept.
- camera
  - Description: Desired camera movement/shot; blank = choose a fitting one.
- audioCue
  - Description: Desired ambience/SFX/dialogue; blank = suggest fitting ambience.

# Example Values
idea:
- "a woman looking out a rain-streaked bus window at night"

camera:
- "slow push-in, close-up"
- (blank)

audioCue:
- "gentle rain, distant traffic"
- (blank)

# Notes
- Recommended system prompt: `SYS-D06-video-prompt-generation`.
- Constraints: 3 params; NL brief + native audio; negatives via param; one dominant action.
- Related: other D06 per-model prompts.

# Keywords
video prompt, Veo, director brief, native audio, camera, text-to-video, D06
