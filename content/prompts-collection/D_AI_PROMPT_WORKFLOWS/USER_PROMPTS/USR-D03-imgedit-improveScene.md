# Prompt ID
USR-D03-imgedit-improveScene

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing

# Description
Single-shot image-editing prompt that raises the quality of an undamaged nature/city photo (sharpness, noise, light, color) without changing content or composition. Attach the source photo.

# Prompt
Improve the overall quality of the nature/city photograph in this image, assuming there is NO physical damage — purely a quality upgrade. Preserve all content, structures, layout, perspective, framing, and composition precisely as in the source. Remove blur, compression artifacts, noise, and haze; increase real sharpness and micro-contrast on meaningful detail (textures, foliage, architecture, edges); recover fine texture and dynamic range so shadows and highlights both hold detail. Improve white balance and color accuracy for natural, true-to-life tones with clean tonal depth, staying fully photorealistic. Do not add, remove, or rearrange elements, and do not over-process. The result should read as the same scene at much higher quality.

(Attach the source photo. Improvement, not restoration or restyling.)

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image.

# Example Values
N/A — attach a soft/noisy nature or city photo.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- **Per-model versions:** `USR-D03-imgedit-improveScene-nanoBananaPro`, `USR-D03-imgedit-improveScene-gptImage`, `USR-D03-imgedit-improveScene-qwenImageEdit`, `USR-D03-imgedit-improveScene-flux2`, `USR-D03-imgedit-improveScene-flux2Klein`, `USR-D03-imgedit-improveScene-stableDiffusion`, `USR-D03-imgedit-improveScene-joyai`
- Constraints: lock content/composition; quality only; photorealistic.
- Related: `USR-D03-imgedit-restoreScene`, `USR-D03-imgedit-restyleSceneCinematic`.

# Keywords
image editing, improvement, landscape, city, sharpness, denoise, img2img, D03
