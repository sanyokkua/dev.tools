# Prompt ID
USR-D03-imgedit-cartoonToPhoto-stableDiffusion

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Stable Diffusion (SDXL / SD 3.5))

# Description
Convert a cartoon or anime image into a photorealistic photograph with realistic skin, fabric, and lighting, while preserving the pose, outfit, and character. Use when you have an anime or cartoon image and want a believable real-photo version of the same character and scene.

# Prompt
## Positive prompt (SDXL — comma-tag style)
photorealistic photograph, realistic human, natural skin texture, realistic fabric and clothing detail, true-to-life lighting, accurate anatomy, sharp focus, depth of field, professional photography, same pose and outfit, recognizable character

## Positive prompt (SD 3.5 — natural sentence)
A photorealistic photograph of the same character in the same pose and outfit, with realistic skin texture, natural fabric detail, and true-to-life lighting, rendered as a believable real photo.

## Negative prompt
cartoon, anime, illustration, 3d render, cel shading, drawing, flat colors, line art, blurry, low quality, jpeg artifacts, noise, deformed, mutated, extra fingers, bad anatomy, plastic skin, watermark, text, changed pose, different character, altered outfit

## Recommended settings
- Denoising strength: 0.5–0.8
- CFG: 6–8 (SDXL) / 4–7 (SD 3.5)
- Sampler: DPM++ 2M Karras, 25–40 steps
- ControlNet / add-ons: Use a photoreal checkpoint; ControlNet Lineart (and optionally Depth/Canny, weight 0.6–0.9) to hold the original pose, outfit, and composition.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Stable Diffusion (SDXL / SD 3.5)
- Related generic version: `USR-D03-imgedit-cartoonToPhoto`
- Negative prompt: a negative prompt is used (see # Prompt section above).
- Recommended settings: see # Prompt section above.

# Keywords
cartoon to photo, anime to realistic, photorealistic conversion, character restyle, stable diffusion, SDXL, SD 3.5, image editing, D03
