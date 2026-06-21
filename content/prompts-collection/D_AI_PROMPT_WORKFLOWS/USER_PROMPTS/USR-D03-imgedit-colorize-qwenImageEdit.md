# Prompt ID
USR-D03-imgedit-colorize-qwenImageEdit

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Qwen-Image-Edit-2511)

# Description
Convert a black-and-white photo into natural, realistic, era-appropriate color while keeping faces, composition, and all detail identical. Use when you have a grayscale or black-and-white photograph and want a believable, naturally colorized version with no other changes.

# Prompt
Colorize this black-and-white photograph with natural, realistic, era-appropriate color while preserving all existing detail, faces, identities, expressions, textures, and composition exactly. Add believable, coherent color only — do not alter, sharpen away, smooth, restyle, or recompose anything. Tasks: render natural and accurate skin tones suited to each person; apply realistic, period-appropriate colors to clothing, fabrics, and accessories; give coherent, true-to-life colors to the environment — foliage, grass, trees, sky, water, wood, stone, metal, and architecture; keep color consistent across the whole image with correct white balance and no color bleeding across edges. Preserve every face, feature, and fine detail exactly as in the original; do not change identity, expression, pose, or layout. Avoid oversaturation, neon or artificial hues, and any monochrome or sepia tint in the result. Output a fully and naturally colorized photorealistic photograph. Keep faces, composition, and all detail identical.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Qwen-Image-Edit-2511
- Related generic version: `USR-D03-imgedit-colorize`
- Negative prompt: a negative prompt is used (monochrome, black and white, grayscale, sepia, desaturated, oversaturated, neon colors, unnatural colors, color bleeding, washed out, changed identity, altered face, distorted features, changed composition, removed detail, oversmoothed, oversharpening, cartoon, illustration, watermark, text, logo)
- Recommended settings: num_inference_steps: 40–50, true_cfg_scale: 4.0, guidance_scale: 1.0, sampler/scheduler: default; Lightning LoRA: 4–8 steps, true_cfg ≈ 1, sampler Euler / Simple; do not downscale the input — keep native resolution; output up to 2560×2560.

# Keywords
colorization, black and white to color, photo colorization, era-appropriate, skin tones, Qwen-Image-Edit-2511, image editing, D03
