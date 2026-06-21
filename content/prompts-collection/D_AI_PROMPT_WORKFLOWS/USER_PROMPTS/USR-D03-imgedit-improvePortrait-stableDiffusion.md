# Prompt ID
USR-D03-imgedit-improvePortrait-stableDiffusion

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Stable Diffusion (SDXL / SD 3.5))

# Description
Raise the quality of an undamaged portrait by removing blur, compression, noise, and haze, sharpening eyes, skin, and hair, and recovering detail and dynamic range with natural skin texture. Use when the portrait has no physical damage but is soft, noisy, compressed, hazy, or poorly lit.

# Prompt
## Positive prompt (SDXL — comma-tag style)
high quality portrait, crisp focus, (sharp eyes:1.2), natural skin texture, fine hair detail, clean clear image, accurate skin tones, balanced dynamic range, soft natural lighting, dehazed, denoised, professional photograph, true-to-source identity

## Positive prompt (SD 3.5 — natural sentence)
A high-quality version of the portrait with the blur, compression, noise, and haze removed, sharp detailed eyes and natural skin texture, fine hair detail and balanced dynamic range, keeping the same person, pose, and composition.

## Negative prompt
blurry, low quality, jpeg artifacts, noise, haze, deformed, mutated, extra fingers, bad anatomy, plastic skin, waxy skin, oversharpened, watermark, text, cartoon, 3d render, illustration, different face, altered identity, changed pose, over-smoothed

## Recommended settings
- Denoising strength: 0.4–0.55 (portraits — avoid melting faces)
- CFG: 6–8 (SDXL) / 4–7 (SD 3.5)
- Sampler: DPM++ 2M Karras, 25–40 steps
- ControlNet / add-ons: ControlNet Tile (preprocessor: none, "My prompt is more important") to recover faithful detail; IP-Adapter-Face to lock identity; finish with Face Detailer / CodeFormer (w≈0.7) or GFPGAN.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Stable Diffusion (SDXL / SD 3.5)
- Related generic version: `USR-D03-imgedit-improvePortrait`
- Negative prompt: a negative prompt is used (see # Prompt section above).
- Recommended settings: see # Prompt section above.

# Keywords
portrait quality improvement, sharpening, denoising, dehaze, stable diffusion, SDXL, SD 3.5, image editing, D03
