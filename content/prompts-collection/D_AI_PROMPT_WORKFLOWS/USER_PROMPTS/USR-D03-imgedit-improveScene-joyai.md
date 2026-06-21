# Prompt ID
USR-D03-imgedit-improveScene-joyai

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (JoyAI Image Edit)

# Description
Raise the technical quality of an undamaged landscape or cityscape while keeping the scene and composition exactly the same. Use when you have a nature/city photo with no physical damage that is soft, noisy, hazy, flat, or dull and just needs more clarity and detail.

# Prompt
Improve the technical quality of the landscape or cityscape in this image without changing the scene. There is no physical damage to repair — focus only on image quality. Remove blur, lens softness, JPEG compression artifacts, sensor noise, and haze; dehaze the atmosphere to reveal distant detail; reduce chromatic aberration. Recover fine detail and sharpen foliage, leaves, grass, water, rock, building facades, windows, brickwork, rooftops, and textures throughout. Recover lost dynamic range: open up shadows, recover blown-out skies and highlights, and add subtle tonal depth and local contrast. Improve white balance and color so the sky, greenery, water, and structures look natural and accurate, not oversaturated. Keep the composition, framing, horizon, perspective, and every structure and natural element exactly where they are — do not add, remove, or move anything. The result should look like the same scene captured with a much better camera and clean processing — crisp, natural, and photorealistic. Keep everything else unchanged.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: JoyAI Image Edit
- Related generic version: `USR-D03-imgedit-improveScene`
- Negative prompt: a negative prompt is used (suppresses changed composition, added/removed objects, oversaturation, HDR halo, oversharpening, etc.)
- Recommended settings: guidance_scale: 4.0; num_inference_steps: 30–50 (40+ for very low-quality sources); basesize: 1024 (buckets 256/512/768/1024); --seed: set a fixed value for reproducibility

# Keywords
landscape enhancement, cityscape quality improvement, dehazing, sharpening, JoyAI, image editing, D03
