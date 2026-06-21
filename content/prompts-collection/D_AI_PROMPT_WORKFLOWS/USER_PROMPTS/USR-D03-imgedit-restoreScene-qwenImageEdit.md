# Prompt ID
USR-D03-imgedit-restoreScene-qwenImageEdit

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Qwen-Image-Edit-2511)

# Description
Repair physical damage in an old or damaged nature/cityscape photo while preserving composition and era-appropriate details. Use when you have a damaged or aged landscape or city photograph (scratches, dust, creases, fading, stains, noise) that needs faithful repair.

# Prompt
Restore this damaged landscape or cityscape photograph. Repair all physical damage and reconstruct missing detail while preserving the original scene, composition, framing, perspective, and all era-appropriate content exactly. Tasks: remove scratches, tears, cracks, creases, fold lines, dust, spots, stains, water marks, mold, and emulsion damage; fill in and reconstruct missing or torn areas using surrounding context; remove film grain, scan noise, and discoloration; fix fading and restore balanced contrast and natural tonal range; correct color casts and uneven exposure; recover lost fine detail in foliage, trees, grass, water, sky, clouds, buildings, architecture, roads, and signage. Keep all structures, vehicles, signs, and period details true to the original era — do not modernize or add anachronistic elements. Do not add or remove buildings, people, or objects, and do not recompose the scene. Output a clean, naturally restored photograph with a modern photographic look while staying faithful to the original. Preserve composition and all content exactly; keep everything else unchanged.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Qwen-Image-Edit-2511
- Related generic version: `USR-D03-imgedit-restoreScene`
- Negative prompt: a negative prompt is used (recomposed, changed composition, added buildings, removed buildings, modernized, anachronistic elements, added people, distorted architecture, warped perspective, oversaturated, unnatural colors, oversharpening, overprocessing, cartoon, illustration, watermark, text, logo)
- Recommended settings: num_inference_steps: 40–50, true_cfg_scale: 4.0, guidance_scale: 1.0, sampler/scheduler: default; Lightning LoRA: 4–8 steps, true_cfg ≈ 1, sampler Euler / Simple; do not downscale the input — keep native resolution; output up to 2560×2560.

# Keywords
landscape restoration, cityscape restoration, damage repair, photo restoration, era-appropriate, Qwen-Image-Edit-2511, image editing, D03
