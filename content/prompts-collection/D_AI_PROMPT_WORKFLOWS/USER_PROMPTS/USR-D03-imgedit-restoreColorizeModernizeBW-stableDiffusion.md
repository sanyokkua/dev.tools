# Prompt ID
USR-D03-imgedit-restoreColorizeModernizeBW-stableDiffusion

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Stable Diffusion (SDXL / SD 3.5))

# Description
Revive an old black-and-white photo in one pass by repairing damage, adding natural color, and bringing it to modern flagship-camera quality, while keeping the scene and people exactly the same. Use when you have an old, damaged, faded, or black-and-white photograph and want a single prompt that restores, colorizes, and modernizes it at once.

# Prompt
## Positive prompt (SDXL — comma-tag style)
restored vintage photograph, fully colorized, natural realistic color, era-appropriate colors, realistic skin tones, damage removed, no scratches, no dust, no tears, no creases, no stains, fading corrected, sharp focus, fine detail recovered, natural skin texture, detailed eyes, detailed hair, detailed fabric, high dynamic range, balanced contrast, accurate white balance, realistic lighting, clean HDR tonal depth, material realism, fabric metal wood glass foliage, modern flagship camera, DSLR, mirrorless, ultra detailed, photorealistic, professional photo, same person, same face, same pose, same composition, same scene, same background, same framing, same camera angle, identity preserved

## Positive prompt (SD 3.5 — natural sentence)
Restore, colorize, and modernize this old black-and-white photograph in a single pass so it looks like the exact same scene photographed today on a top-tier modern camera. Repair all physical damage: remove scratches, tears, cracks, creases, dust, spots, stains, and fading, and reconstruct any missing detail. Add natural, realistic, era-appropriate color with coherent skin tones, period-correct clothing colors, and natural background colors. Recover sharp fine detail and realistic textures in faces, hair, skin, eyes, and clothing while keeping natural skin texture without plastic smoothing. Improve dynamic range, local contrast, white balance, color accuracy, and lighting realism. Keep the same people, identities, faces, expressions, poses, clothing design, objects, background, scene layout, composition, camera angle, and framing exactly unchanged — only repair, colorize, and upgrade quality. Photorealistic, natural colors, realistic skin tones.

## Negative prompt
monochrome, grayscale, sepia, scratches, dust, stains, tears, creases, blurry, low quality, jpeg artifacts, noise, deformed, extra fingers, bad anatomy, plastic skin, oversaturated, unnatural colors, watermark, text, cartoon, 3d render, different person, altered face, changed pose

## Recommended settings
- Denoise: 0.35–0.5 (portraits 0.4–0.5 to avoid melting faces; lean higher because color must be invented)
- CFG: SDXL 6–8 / SD 3.5 4–7
- Sampler: DPM++ 2M Karras, 25–40 steps
- ControlNet Tile: preprocessor none, "My prompt is more important" — holds structure while adding detail + color
- IP-Adapter-Face: lock identity on portraits
- Face fix: Face Detailer / CodeFormer (w ≈ 0.7) or GFPGAN as a finishing pass

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Stable Diffusion (SDXL / SD 3.5)
- Related generic version: `USR-D03-imgedit-restoreColorizeModernizeBW`
- Negative prompt: a negative prompt is used (see # Prompt section above).
- Recommended settings: see # Prompt section above.

# Keywords
restore colorize modernize, all-in-one, black and white revival, vintage photo, stable diffusion, SDXL, SD 3.5, image editing, D03
