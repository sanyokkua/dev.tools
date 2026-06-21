# Prompt ID
USR-D03-imgedit-photoToAnime-qwenImageEdit

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Qwen-Image-Edit-2511)

# Description
Transform a real photograph into an anime/cartoon illustration while keeping the same subject(s), pose, and composition recognizable. Use when you have a real photo and want a stylized anime or cartoon illustration of the same scene.

# Prompt
Transform this real photograph into a high-quality anime / cartoon illustration while keeping the same subject(s), pose, expression, gesture, framing, and overall composition recognizable. Re-render everything in a clean, polished anime/cartoon art style: smooth cel-shaded coloring, bold confident line art, simplified stylized shapes, expressive anime-style eyes and features, vibrant harmonious colors, soft anime lighting and shading, and a coherently illustrated background that matches the original scene. Preserve who and what is in the image — keep the same people, their poses, hairstyles, outfits, key colors, and the same scene layout — so the subject stays recognizable as an anime version of the original. You may fully change the medium and rendering from photographic to illustrated; do not change the pose, the number of people, or the composition. Output a crisp, well-drawn anime/cartoon illustration. Keep subjects, pose, and composition consistent with the original.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Qwen-Image-Edit-2511
- Related generic version: `USR-D03-imgedit-photoToAnime`
- Negative prompt: a negative prompt is used (photorealistic, realistic photo, 3d render, changed pose, changed composition, different person, extra people, removed people, extra limbs, extra fingers, deformed hands, warped anatomy, messy line art, sketchy, low quality, blurry, watermark, text, logo, signature)
- Recommended settings: num_inference_steps: 40–50, true_cfg_scale: 4.0, guidance_scale: 1.0, sampler/scheduler: default; Lightning LoRA: 4–8 steps, true_cfg ≈ 1, sampler Euler / Simple; keep native resolution; output up to 2560×2560.

# Keywords
photo to anime, style transfer, anime illustration, cartoon, cel-shading, Qwen-Image-Edit-2511, image editing, D03
