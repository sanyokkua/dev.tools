# Prompt ID
USR-D03-imgedit-improveScene-stableDiffusion

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Stable Diffusion (SDXL / SD 3.5))

# Description
Raise the quality of an undamaged landscape or city photo by improving clarity, detail, and dynamic range, dehazing, restoring natural colors, and sharpening, while keeping the scene exactly as-is. Use when the source scene has no physical damage but is soft, hazy, low-contrast, or noisy.

# Prompt
## Positive prompt (SDXL — comma-tag style)
high quality landscape photograph, crisp clarity, fine detail in foliage and architecture, balanced dynamic range, dehazed, natural accurate colors, sharp textures, clean clear sky, well-exposed, denoised, professional photograph, true-to-source composition

## Positive prompt (SD 3.5 — natural sentence)
A high-quality version of the landscape or cityscape with improved clarity and fine detail, haze removed and natural balanced colors restored, sharper textures and wider dynamic range, keeping the exact same scene and composition.

## Negative prompt
blurry, low quality, jpeg artifacts, noise, haze, oversharpened, watermark, text, cartoon, 3d render, illustration, oversaturated, unnatural colors, changed composition, altered architecture, added elements

## Recommended settings
- Denoising strength: 0.2–0.45
- CFG: 6–8 (SDXL) / 4–7 (SD 3.5)
- Sampler: DPM++ 2M Karras, 25–40 steps
- ControlNet / add-ons: ControlNet Tile (preprocessor: none, "My prompt is more important") for faithful detail recovery and to hold the exact composition.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Stable Diffusion (SDXL / SD 3.5)
- Related generic version: `USR-D03-imgedit-improveScene`
- Negative prompt: a negative prompt is used (see # Prompt section above).
- Recommended settings: see # Prompt section above.

# Keywords
landscape quality improvement, cityscape enhancement, dehaze, clarity, stable diffusion, SDXL, SD 3.5, image editing, D03
