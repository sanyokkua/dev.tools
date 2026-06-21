# Prompt ID
USR-D03-imgedit-restylePortraitPro-stableDiffusion

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Stable Diffusion (SDXL / SD 3.5))

# Description
Re-render a casual portrait as a modern high-end or cinematic camera studio or editorial headshot while keeping the exact facial features and identity. Use when you have a casual snapshot portrait and want a polished studio or editorial look without changing who the person is.

# Prompt
## Positive prompt (SDXL — comma-tag style)
professional studio portrait, editorial headshot, shot on 85mm lens, shallow depth of field, soft key light, clean seamless backdrop, flattering rim light, crisp sharp eyes, natural skin texture, high-end retouching, cinematic color, photographic, same person, preserved facial features

## Positive prompt (SD 3.5 — natural sentence)
A modern high-end studio portrait of the same person with identical facial features, lit with a soft key light and gentle rim light against a clean backdrop, shot on an 85mm lens with shallow depth of field and natural skin texture, in a polished editorial style.

## Negative prompt
blurry, low quality, jpeg artifacts, noise, deformed, mutated, extra fingers, bad anatomy, plastic skin, waxy skin, oversharpened, watermark, text, cartoon, 3d render, illustration, different face, altered identity, distorted features, busy background

## Recommended settings
- Denoising strength: 0.45–0.6 (portrait)
- CFG: 6–8 (SDXL) / 4–7 (SD 3.5)
- Sampler: DPM++ 2M Karras, 25–40 steps
- ControlNet / add-ons: IP-Adapter-Face to lock identity; optional ControlNet Tile/Depth to hold pose; finish with Face Detailer / CodeFormer (w≈0.7) for clean, non-waxy skin.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Stable Diffusion (SDXL / SD 3.5)
- Related generic version: `USR-D03-imgedit-restylePortraitPro`
- Negative prompt: a negative prompt is used (see # Prompt section above).
- Recommended settings: see # Prompt section above.

# Keywords
portrait restyle, professional headshot, studio portrait, editorial, stable diffusion, SDXL, SD 3.5, image editing, D03
