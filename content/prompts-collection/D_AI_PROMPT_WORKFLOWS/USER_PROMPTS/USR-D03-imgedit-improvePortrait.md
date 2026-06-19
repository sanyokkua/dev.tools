# Prompt ID
USR-D03-imgedit-improvePortrait

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing

# Description
Single-shot image-editing prompt that raises the quality of an undamaged portrait (sharpness, noise, light, color) without changing identity, pose, or composition. Attach the source portrait.

# Prompt
Improve the overall quality of the portrait in this image, assuming there is NO physical damage to repair — this is purely a quality upgrade. Preserve every face, identity, facial structure, expression, hairstyle, clothing, pose, camera angle, framing, and composition precisely as in the source. Remove blur, motion softness, compression artifacts, sensor/color noise, haze, and chromatic aberration. Increase real sharpness and micro-contrast where it matters (eyes, eyelashes, brows, skin pores, lips, hair strands), recover fine texture, and restore dynamic range. Keep skin texture natural and realistic — no plastic smoothing, no waxy look, no beautification, slimming, or reshaping. Improve white balance and color accuracy so skin tones look true. The result should read as the same portrait, captured and processed at much higher quality.

(Attach the source portrait. Improvement, not restoration or restyling — stay faithful to identity and composition.)

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image.

# Example Values
N/A — attach a soft/noisy/low-quality portrait.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- **Per-model versions:** `../New Image Prompts/<model>/03-improvement-portrait.md` (7 models).
- Constraints: lock identity/pose/composition; quality only; no beautification.
- Related: `USR-D03-imgedit-restorePortrait` (when there IS damage), `USR-D03-imgedit-restylePortraitPro`.

# Keywords
image editing, improvement, portrait, sharpness, denoise, quality, img2img, D03
