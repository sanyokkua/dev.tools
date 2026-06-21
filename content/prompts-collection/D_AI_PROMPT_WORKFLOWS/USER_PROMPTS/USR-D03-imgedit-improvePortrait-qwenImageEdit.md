# Prompt ID
USR-D03-imgedit-improvePortrait-qwenImageEdit

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Qwen-Image-Edit-2511)

# Description
Raise the technical quality of an undamaged portrait (sharpness, clarity, color, dynamic range) while keeping identity, pose, and composition unchanged. Use when you have an intact but low-quality portrait — blurry, noisy, compressed, hazy, or flat — and want a clean, high-quality version with no restyling.

# Prompt
Improve the technical quality of this portrait photograph while preserving the person's exact identity, facial structure, expression, pose, camera angle, framing, and composition. Assume no physical damage — focus only on raising image quality. Tasks: remove blur, motion blur, out-of-focus softness, compression artifacts, blocking, banding, sensor noise, grain, haze, and chromatic aberration; increase sharpness, clarity, and micro-contrast on the eyes, eyelashes, eyebrows, skin pores, hair, and lips; recover fine detail and realistic textures; expand dynamic range and recover detail in shadows and highlights; improve lighting realism, local contrast, white balance, and color accuracy; render natural, realistic skin tones and skin texture with visible pores — no plastic smoothing, no airbrushing, no beautification. Keep the face, identity, age, expression, hairstyle, clothing, pose, and layout exactly the same. Do not reshape features, do not restyle, do not add or remove anything. Output ultra-clean, natural, photorealistic quality with subtle HDR-like tonal depth. Preserve identity and composition exactly; keep everything else unchanged.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Qwen-Image-Edit-2511
- Related generic version: `USR-D03-imgedit-improvePortrait`
- Negative prompt: a negative prompt is used (different person, altered face, changed identity, distorted features, reshaped face, beautified, younger, makeup added, plastic skin, oversmoothed skin, waxy skin, oversharpening, halos, overprocessing, oversaturated, cartoon, illustration, extra fingers, deformed hands, warped anatomy, changed pose, changed clothing, watermark, text, logo)
- Recommended settings: num_inference_steps: 40–50, true_cfg_scale: 4.0, guidance_scale: 1.0, sampler/scheduler: default; Lightning LoRA: 4–8 steps, true_cfg ≈ 1, sampler Euler / Simple; do not downscale the input — keep native resolution; output up to 2560×2560.

# Keywords
portrait quality improvement, sharpness, upscaling, noise removal, identity preservation, Qwen-Image-Edit-2511, image editing, D03
