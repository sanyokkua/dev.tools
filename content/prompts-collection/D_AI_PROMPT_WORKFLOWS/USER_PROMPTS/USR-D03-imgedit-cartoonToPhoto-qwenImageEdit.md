# Prompt ID
USR-D03-imgedit-cartoonToPhoto-qwenImageEdit

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Qwen-Image-Edit-2511)

# Description
Transform a cartoon/anime image into a photorealistic real photograph while preserving pose, outfit, and character identity. Use when you have a cartoon or anime illustration and want a realistic photographic version of the same character and scene.

# Prompt
Transform this cartoon / anime illustration into a photorealistic real photograph while preserving the character's identity, pose, expression, gesture, hairstyle, outfit, key colors, framing, and overall composition. Re-render everything as a real photograph: realistic human skin with natural pores and subsurface detail, realistic eyes and hair, true-to-life fabric textures and materials, accurate physically based lighting and shadows, natural depth of field, realistic proportions and anatomy, and a believable photographic background consistent with the original scene. Convert the illustrated/cel-shaded look into convincing real-world photography while keeping the same character recognizable — same pose, same clothing, same scene layout, same number of subjects. Do not keep any cartoon, anime, line-art, or flat-shading qualities. Output a natural, photorealistic photograph as if shot with a real camera. Preserve pose, outfit, character identity, and composition.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Qwen-Image-Edit-2511
- Related generic version: `USR-D03-imgedit-cartoonToPhoto`
- Negative prompt: a negative prompt is used (cartoon, anime, illustration, drawing, sketch, line art, cel shading, flat shading, 3d render, cgi, plastic skin, waxy skin, doll-like, changed pose, changed outfit, different character, extra limbs, extra fingers, deformed hands, warped anatomy, watermark, text, logo)
- Recommended settings: num_inference_steps: 40–50, true_cfg_scale: 4.0, guidance_scale: 1.0, sampler/scheduler: default; Lightning LoRA: 4–8 steps, true_cfg ≈ 1, sampler Euler / Simple; keep native resolution; output up to 2560×2560.

# Keywords
cartoon to photo, anime to realistic, style transfer, photorealism, character, Qwen-Image-Edit-2511, image editing, D03
