# Prompt ID
USR-D03-imgedit-improveScene-qwenImageEdit

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Qwen-Image-Edit-2511)

# Description
Raise the technical quality of an undamaged nature/city photo (clarity, detail, dynamic range, dehaze) while keeping the scene and composition exactly. Use when you have an intact but low-quality landscape or city photo — blurry, noisy, compressed, hazy, or flat — and want a crisp, high-quality version with no restyling.

# Prompt
Improve the technical quality of this landscape or cityscape photograph while preserving the original scene, composition, framing, and perspective exactly. Assume no physical damage — focus only on raising image quality. Tasks: remove blur, out-of-focus softness, compression artifacts, blocking, banding, sensor noise, grain, atmospheric haze, and chromatic aberration; dehaze and increase clarity; sharpen and recover fine detail in architecture, building edges, windows, textures, foliage, trees, grass, rocks, water, and clouds; expand dynamic range and recover detail in shadows and bright skies; improve lighting realism, local contrast, white balance, and color accuracy with natural, true-to-life colors. Keep all content, structures, vehicles, signage, and the layout exactly the same. Do not add or remove anything, do not restyle, do not recompose. Output ultra-clean, natural, photorealistic quality with subtle HDR-like tonal depth and crisp detail. Preserve the scene and composition exactly; keep everything else unchanged.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Qwen-Image-Edit-2511
- Related generic version: `USR-D03-imgedit-improveScene`
- Negative prompt: a negative prompt is used (recomposed, changed composition, added buildings, removed buildings, added people, distorted architecture, warped perspective, oversaturated, unnatural colors, neon colors, oversharpening, halos, overprocessing, HDR halos, cartoon, illustration, watermark, text, logo)
- Recommended settings: num_inference_steps: 40–50, true_cfg_scale: 4.0, guidance_scale: 1.0, sampler/scheduler: default; Lightning LoRA: 4–8 steps, true_cfg ≈ 1, sampler Euler / Simple; do not downscale the input — keep native resolution; output up to 2560×2560.

# Keywords
landscape quality improvement, cityscape enhancement, dehaze, sharpness, noise removal, Qwen-Image-Edit-2511, image editing, D03
