# Prompt ID
USR-D03-imgedit-restyleSceneCinematic-qwenImageEdit

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Qwen-Image-Edit-2511)

# Description
Apply a professional cinematic camera look and color grade to a nature/city scene while keeping all content and composition the same. Use when you have a flat or ordinary landscape or city photo and want a high-end, film-like cinematic version.

# Prompt
Re-render this landscape or cityscape photograph with a professional cinematic camera look and color grade while preserving all content, scene, composition, framing, and perspective exactly. Apply a high-end cinematic treatment: a refined teal-and-orange or warm golden-hour color grade, rich but controlled contrast, deep balanced shadows and gentle highlight rolloff, cinematic dynamic range, a subtle anamorphic widescreen feel, soft atmospheric depth, and very subtle film grain. Render high-end professional camera image quality with crisp detail in architecture, foliage, water, and sky, and natural yet stylized lighting that feels like a movie still. Keep every building, structure, object, and element in place — do not add, remove, move, or recompose anything, and do not distort architecture or perspective. Only change the lighting mood, color grade, and overall cinematic finish. Output a polished, photorealistic cinematic photograph. Preserve all content and composition exactly; keep everything else unchanged.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Qwen-Image-Edit-2511
- Related generic version: `USR-D03-imgedit-restyleSceneCinematic`
- Negative prompt: a negative prompt is used (recomposed, changed composition, added buildings, removed buildings, added people, distorted architecture, warped perspective, oversaturated, garish colors, neon, HDR halos, overprocessing, oversharpening, cartoon, illustration, painting, watermark, text, logo)
- Recommended settings: num_inference_steps: 40–50, true_cfg_scale: 4.0, guidance_scale: 1.0, sampler/scheduler: default; Lightning LoRA: 4–8 steps, true_cfg ≈ 1, sampler Euler / Simple; keep native resolution; output up to 2560×2560.

# Keywords
cinematic restyle, color grade, teal-orange, landscape, cityscape, Qwen-Image-Edit-2511, image editing, D03
