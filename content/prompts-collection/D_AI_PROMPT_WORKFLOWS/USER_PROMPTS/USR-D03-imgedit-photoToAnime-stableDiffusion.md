# Prompt ID
USR-D03-imgedit-photoToAnime-stableDiffusion

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Stable Diffusion (SDXL / SD 3.5))

# Description
Convert a real photo into an anime or cartoon illustration while keeping the subject, pose, and composition recognizable. Use when you want an anime or cartoon rendering of a real photograph, retaining the original layout.

# Prompt
## Positive prompt (SDXL — comma-tag style)
anime illustration, cel shaded, clean line art, vibrant flat colors, expressive anime eyes, stylized hair, soft anime shading, detailed background, high quality anime art, same subject and pose, recognizable composition

## Positive prompt (SD 3.5 — natural sentence)
An anime-style illustration of the same subject in the same pose and composition, with clean line art, cel shading, vibrant flat colors, and expressive stylized features.

## Negative prompt
photorealistic, realistic, photo, 3d render, blurry, low quality, jpeg artifacts, noise, deformed, mutated, extra fingers, bad anatomy, watermark, text, oversaturated, changed pose, changed composition, different subject

## Recommended settings
- Denoising strength: 0.5–0.8
- CFG: 6–8 (SDXL) / 4–7 (SD 3.5)
- Sampler: DPM++ 2M Karras, 25–40 steps
- ControlNet / add-ons: Use an anime checkpoint (e.g., an SDXL anime model); ControlNet Canny / Lineart / Depth (weight 0.6–0.9) to hold structure, pose, and composition.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Stable Diffusion (SDXL / SD 3.5)
- Related generic version: `USR-D03-imgedit-photoToAnime`
- Negative prompt: a negative prompt is used (see # Prompt section above).
- Recommended settings: see # Prompt section above.

# Keywords
photo to anime, cartoon conversion, cel shading, anime illustration, stable diffusion, SDXL, SD 3.5, image editing, D03
