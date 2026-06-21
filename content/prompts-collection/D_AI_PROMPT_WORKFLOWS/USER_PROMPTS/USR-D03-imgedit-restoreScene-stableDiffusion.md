# Prompt ID
USR-D03-imgedit-restoreScene-stableDiffusion

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Stable Diffusion (SDXL / SD 3.5))

# Description
Repair physical damage on an old or damaged landscape or city photo while preserving composition and era-accurate detail. Use when the source nature or cityscape has scratches, dust, fading, stains, creases, or noise to remove without altering the scene.

# Prompt
## Positive prompt (SDXL — comma-tag style)
restored landscape photograph, clean undamaged scene, recovered detail in foliage and architecture, balanced contrast, intact sky gradient, accurate period detail, even exposure, true-to-source colors, faithful reconstruction, sharp natural textures, high fidelity, photographic

## Positive prompt (SD 3.5 — natural sentence)
A faithfully restored landscape or cityscape photograph with all physical damage removed, recovering detail in the foliage, architecture, and sky, with balanced contrast and the original composition and era-accurate details preserved.

## Negative prompt
scratches, dust, stains, tears, creases, blurry, low quality, jpeg artifacts, noise, deformed, oversharpened, watermark, text, cartoon, 3d render, illustration, modern additions, changed composition, altered architecture, unnatural colors

## Recommended settings
- Denoising strength: 0.2–0.45
- CFG: 6–8 (SDXL) / 4–7 (SD 3.5)
- Sampler: DPM++ 2M Karras, 25–40 steps
- ControlNet / add-ons: ControlNet Tile (preprocessor: none, "My prompt is more important") for faithful detail recovery across foliage, architecture, and sky.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Stable Diffusion (SDXL / SD 3.5)
- Related generic version: `USR-D03-imgedit-restoreScene`
- Negative prompt: a negative prompt is used (see # Prompt section above).
- Recommended settings: see # Prompt section above.

# Keywords
landscape restoration, cityscape repair, scene restoration, era-accurate, stable diffusion, SDXL, SD 3.5, image editing, D03
