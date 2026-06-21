# Prompt ID
USR-D03-imgedit-colorize-stableDiffusion

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Stable Diffusion (SDXL / SD 3.5))

# Description
Add natural, era-appropriate color to a black-and-white photo with coherent tones, keeping faces, composition, and detail identical. Use when you have a grayscale photograph and want a realistic color version without changing any content.

# Prompt
## Positive prompt (SDXL — comma-tag style)
naturally colorized photograph, realistic era-appropriate colors, accurate skin tones, coherent natural color palette, true-to-period clothing colors, balanced color, photographic, detail preserved, same faces and composition

## Positive prompt (SD 3.5 — natural sentence)
A naturally colorized version of the black-and-white photograph with realistic, era-appropriate colors and accurate skin tones, keeping the faces, composition, and all detail exactly the same.

## Negative prompt
monochrome, sepia, grayscale, oversaturated, unnatural colors, blurry, low quality, jpeg artifacts, noise, deformed, watermark, text, cartoon, 3d render, illustration, changed faces, altered composition, modern colors, neon colors

## Recommended settings
- Denoising strength: 0.2–0.3 (low — keep structure intact) or use a colorization ControlNet
- CFG: 6–8 (SDXL) / 4–7 (SD 3.5)
- Sampler: DPM++ 2M Karras, 25–40 steps
- ControlNet / add-ons: ControlNet Tile or a dedicated colorization/recolor ControlNet (preprocessor: none, "My prompt is more important") to keep structure perfectly; the SD 3.5 sentence prompt works well here.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Stable Diffusion (SDXL / SD 3.5)
- Related generic version: `USR-D03-imgedit-colorize`
- Negative prompt: a negative prompt is used (see # Prompt section above).
- Recommended settings: see # Prompt section above.

# Keywords
colorization, black and white to color, era-appropriate color, grayscale, stable diffusion, SDXL, SD 3.5, image editing, D03
