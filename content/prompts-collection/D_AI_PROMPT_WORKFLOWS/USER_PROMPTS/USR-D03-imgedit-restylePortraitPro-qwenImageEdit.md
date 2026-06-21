# Prompt ID
USR-D03-imgedit-restylePortraitPro-qwenImageEdit

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (Qwen-Image-Edit-2511)

# Description
Re-render a casual portrait as a modern high-end / professional camera shot (studio or editorial headshot) while keeping the exact face and identity. Use when you have a casual snapshot portrait and want it to look like a professional studio or editorial photograph without changing who the person is.

# Prompt
Re-render this casual portrait as a modern high-end professional camera photograph while preserving the person's exact identity, facial features, facial structure, expression, and pose. Transform the look and lighting into a professional studio or editorial headshot: soft directional key light with gentle fill, flattering and even illumination, a clean uncluttered backdrop, 85mm portrait lens look at f/1.8 with shallow depth of field and smooth background blur (bokeh), pleasing tonal contrast, and natural, accurate color. Render high-end DSLR / mirrorless image quality with crisp focus on the eyes, realistic skin texture with visible pores, natural skin tones, and refined detail in hair and clothing. Keep the exact same face and identity — do not reshape, beautify, or alter facial features, age, or expression. You may refine framing slightly for a headshot crop, improve the lighting, and clean or blur the background, but keep the subject recognizable and the pose the same. Output a polished, photorealistic professional portrait. Preserve face and identity exactly; keep the subject unchanged.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: Qwen-Image-Edit-2511
- Related generic version: `USR-D03-imgedit-restylePortraitPro`
- Negative prompt: a negative prompt is used (different person, altered face, changed identity, distorted features, reshaped face, beautified, younger, plastic skin, waxy skin, oversmoothed skin, airbrushed, oversharpening, overprocessing, cartoon, illustration, extra fingers, deformed hands, warped anatomy, harsh flash, blown highlights, watermark, text, logo)
- Recommended settings: num_inference_steps: 40–50, true_cfg_scale: 4.0, guidance_scale: 1.0, sampler/scheduler: default; Lightning LoRA: 4–8 steps, true_cfg ≈ 1, sampler Euler / Simple; keep native resolution; output up to 2560×2560.

# Keywords
portrait restyle, professional headshot, studio lighting, bokeh, identity preservation, Qwen-Image-Edit-2511, image editing, D03
