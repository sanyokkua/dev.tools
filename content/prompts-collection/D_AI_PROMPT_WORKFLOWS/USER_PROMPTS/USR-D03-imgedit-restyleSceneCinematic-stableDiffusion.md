# Prompt ID
USR-D03-imgedit-restyleSceneCinematic-stableDiffusion

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Stable Diffusion (SDXL / SD 3.5))

# Description
Give a landscape or city photo a pro or cinematic camera look with a color grade (teal-orange or golden-hour) and subtle film grain, while keeping the content and composition intact. Use when you want a movie-still or cinematic mood on an existing scene without changing what is in it.

# Prompt
## Positive prompt (SDXL — comma-tag style)
cinematic landscape photograph, film still, professional camera look, teal and orange color grade, golden hour lighting, soft atmospheric haze, subtle film grain, wide dynamic range, dramatic natural light, anamorphic feel, high detail, photographic, same scene and composition

## Positive prompt (SD 3.5 — natural sentence)
A cinematic film-still version of the same landscape or cityscape with a professional color grade, either teal-and-orange or warm golden-hour tones, with soft atmospheric light and subtle film grain, keeping the exact same content and composition.

## Negative prompt
blurry, low quality, jpeg artifacts, noise, oversharpened, watermark, text, cartoon, 3d render, illustration, oversaturated, unnatural colors, changed composition, altered architecture, added elements, flat lighting

## Recommended settings
- Denoising strength: 0.6–0.8 (scene restyle)
- CFG: 6–8 (SDXL) / 4–7 (SD 3.5)
- Sampler: DPM++ 2M Karras, 25–40 steps
- ControlNet / add-ons: ControlNet Tile or Depth/Canny (weight 0.6–0.9) to hold composition while the grade and mood change.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Stable Diffusion (SDXL / SD 3.5)
- Related generic version: `USR-D03-imgedit-restyleSceneCinematic`
- Negative prompt: a negative prompt is used (see # Prompt section above).
- Recommended settings: see # Prompt section above.

# Keywords
cinematic restyle, color grade, film still, teal orange, stable diffusion, SDXL, SD 3.5, image editing, D03
