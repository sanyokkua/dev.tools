# Prompt ID
USR-D03-imgedit-restorePortrait

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing

# Description
Single-shot image-editing prompt that restores a damaged or old portrait while locking identity, pose, and composition. Paste it into an image-editing model and attach the source portrait.

# Prompt
Restore the portrait in this image. Repair physical damage — scratches, tears, creases, stains, fading, dust, and missing areas — and reduce noise and blur, while keeping every person EXACTLY as they are. Preserve each face, identity, facial structure, expression, hairstyle, clothing, pose, camera angle, framing, and the overall composition precisely as in the source. Reconstruct only what is damaged, inferring plausibly from surrounding intact detail. Keep skin texture natural and realistic (visible pores, fine detail) — no plastic smoothing, no waxy or airbrushed look, no beautification or reshaping. The result should read as the same photograph, faithfully repaired.

(Attach the source portrait. This is restoration, not restyling — stay faithful to the original.)

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach a damaged/old portrait image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional — this prompt is self-contained).
- **Per-model ready-to-paste versions** (tuned to each model's paradigm: negatives/weights vs natural language) live in `../New Image Prompts/<model>/01-restoration-portrait.md` for: Nano-Banana-Pro, GPT-Image, Qwen-Image-Edit-2511, FLUX.2, FLUX.2-Klein-4B, Stable-Diffusion, JoyAI-Image-Edit.
- Constraints: lock identity/pose/composition; repair damage only; honesty — generative restoration invents plausible detail, do not present as documentary truth.
- Related: `USR-D03-imgedit-improvePortrait` (quality boost, no damage), `USR-D03-imgedit-colorize`.

# Keywords
image editing, restoration, portrait, repair, identity lock, img2img, D03
