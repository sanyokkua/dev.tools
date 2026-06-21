# Prompt ID
USR-D03-imgedit-restorePortrait-stableDiffusion

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Stable Diffusion (SDXL / SD 3.5))

# Description
Repair physical damage on an old or damaged portrait while preserving the person's identity, expression, and composition. Use when the source portrait has scratches, tears, dust, creases, fading, stains, or heavy noise that must be removed without restyling.

# Prompt
## Positive prompt (SDXL — comma-tag style)
restored vintage portrait, clean undamaged photograph, original facial features preserved, natural skin texture, sharp eyes, accurate skin tones, intact details, even tonal balance, recovered fine detail, faithful reconstruction, true-to-source lighting, high fidelity, photographic

## Positive prompt (SD 3.5 — natural sentence)
A faithfully restored portrait photograph with all physical damage removed, showing the same person with their original facial features, expression, and natural skin texture intact, balanced tones and recovered fine detail, kept true to the source image.

## Negative prompt
scratches, dust, stains, tears, creases, blurry, low quality, jpeg artifacts, noise, deformed, mutated, extra fingers, bad anatomy, plastic skin, oversharpened, watermark, text, cartoon, 3d render, illustration, beautified, different face, altered identity, changed composition

## Recommended settings
- Denoising strength: 0.4–0.55 (portraits — high enough to repair, low enough to avoid melting the face)
- CFG: 6–8 (SDXL) / 4–7 (SD 3.5)
- Sampler: DPM++ 2M Karras, 25–40 steps
- ControlNet / add-ons: ControlNet Tile (preprocessor: none, "My prompt is more important") to recover faithful detail; IP-Adapter-Face to lock identity; finish with Face Detailer / CodeFormer (w≈0.7) or GFPGAN to avoid waxiness.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Stable Diffusion (SDXL / SD 3.5)
- Related generic version: `USR-D03-imgedit-restorePortrait`
- Negative prompt: a negative prompt is used (see # Prompt section above).
- Recommended settings: see # Prompt section above.

# Keywords
portrait restoration, damage repair, photo restoration, identity preservation, stable diffusion, SDXL, SD 3.5, image editing, D03
