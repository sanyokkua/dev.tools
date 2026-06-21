# Prompt ID
USR-D03-imgedit-restorePortrait-qwenImageEdit

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Qwen-Image-Edit-2511)

# Description
Repair physical damage in an old or damaged portrait while keeping the person's identity, expression, and composition exactly the same. Use when you have a scanned, aged, or physically damaged portrait (scratches, tears, dust, creases, fading, stains, noise) that needs faithful repair, not beautification.

# Prompt
Restore this damaged portrait photograph. Repair all physical damage and reconstruct missing detail while preserving the person's exact identity, facial structure, expression, pose, camera angle, framing, and composition. Tasks: remove scratches, tears, cracks, creases, fold lines, dust, spots, stains, water marks, mold, and emulsion damage; fill in and reconstruct missing or torn areas using surrounding context; remove film grain, scan noise, and discoloration; fix fading and restore balanced contrast and natural tonal range; correct color casts and uneven exposure; recover lost fine detail in skin, eyes, hair, eyebrows, lips, and clothing. Keep skin texture natural and realistic — no plastic smoothing, no beautification, no reshaping of the face. Do not change identity, age, facial features, expression, or hairstyle. Do not restyle, recompose, or add or remove people or objects. Output a clean, naturally restored photograph with a modern photographic look. Preserve face, identity, and composition exactly; keep everything else unchanged.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Qwen-Image-Edit-2511
- Related generic version: `USR-D03-imgedit-restorePortrait`
- Negative prompt: a negative prompt is used (different person, altered face, changed identity, distorted features, reshaped face, beautified, younger, makeup added, plastic skin, oversmoothed skin, oversharpening, overprocessing, cartoon, illustration, extra fingers, deformed hands, warped anatomy, added objects, removed people, recomposed, watermark, text, logo)
- Recommended settings: num_inference_steps: 40–50, true_cfg_scale: 4.0, guidance_scale: 1.0, sampler/scheduler: default; Lightning LoRA: 4–8 steps, true_cfg ≈ 1, sampler Euler / Simple; do not downscale the input — keep native resolution; output up to 2560×2560.

# Keywords
portrait restoration, damage repair, photo restoration, identity preservation, Qwen-Image-Edit-2511, image editing, D03
