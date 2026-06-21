# Prompt ID
USR-D03-imgedit-restoreColorizeModernizeBW-qwenImageEdit

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Qwen-Image-Edit-2511)

# Description
Revive an old black-and-white photo in one pass — repair damage, add natural color, and bring it to modern flagship-camera quality, keeping the scene and people exactly the same. Use when you have an old, damaged, faded, or black-and-white photograph and want a single prompt that restores, colorizes, and modernizes it at once.

# Prompt
Restore, colorize, and modernize this old photograph in a single pass. Do all of the following:

Repair physical damage: remove scratches, tears, cracks, creases, dust, spots, stains, water marks, mold, and fading. Reconstruct missing or torn areas using surrounding detail.
Clean the image: remove film grain, noise, blur, haze, compression artifacts, and chromatic aberration.
Recover detail: rebuild realistic fine detail and sharp textures in faces, hair, skin, eyes, clothing, fabric, and background.
Colorize: add natural, realistic, era-appropriate color to this black-and-white / faded / sepia image — coherent realistic skin tones, period-correct clothing colors, natural environment and background colors. Make color distribution physically plausible and consistent across the whole scene.
Modernize quality: improve sharpness, dynamic range, local contrast, white balance, and color accuracy. Add clean HDR-like tonal depth and realistic lighting. Enhance material realism for fabric, skin, metal, wood, glass, and foliage so the result looks like the exact same scene photographed today on a top-tier modern camera.

Preserve everything real and unchanged: same people, identities, faces, facial structure, expressions, ages, poses, hairstyles, clothing design, accessories, objects, background, scene layout, composition, camera angle, and framing. Keep natural skin texture without plastic smoothing. Do not add, remove, restyle, or rearrange anything — only repair, colorize, and upgrade quality.

Output: ultra-clean photorealistic professional camera quality, natural colors, realistic skin tones.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Qwen-Image-Edit-2511
- Related generic version: `USR-D03-imgedit-restoreColorizeModernizeBW`
- Negative prompt: a negative prompt is used (different person, altered face, changed identity, distorted features, plastic skin, oversharpening, monochrome, grayscale, sepia, oversaturated, unnatural colors, color bleeding, extra fingers, deformed hands, added objects, removed objects, changed pose, cartoon, painting, watermark, text)
- Recommended settings: num_inference_steps: 40–50, true_cfg_scale: 4.0, guidance_scale: 1.0; Lightning LoRA path: 4–8 steps, true_cfg ≈ 1.0, Euler / Simple scheduler; do not downscale the input — keep native resolution; output up to 2560×2560.

# Keywords
restore colorize modernize, old photo revival, black and white, damage repair, colorization, Qwen-Image-Edit-2511, image editing, D03
