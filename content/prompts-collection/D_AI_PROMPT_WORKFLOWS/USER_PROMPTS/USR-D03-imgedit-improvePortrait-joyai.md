# Prompt ID
USR-D03-imgedit-improvePortrait-joyai

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (JoyAI Image Edit)

# Description
Raise the technical quality of an undamaged portrait while keeping identity, pose, and composition exactly the same. Use when you have a portrait with no physical damage that is blurry, noisy, compressed, hazy, soft, or poorly lit and just needs to look sharper and cleaner.

# Prompt
Improve the technical quality of the portrait in this image without changing the person or the scene. There is no physical damage to repair — focus only on image quality. Remove blur, motion blur, lens softness, JPEG compression artifacts, sensor noise, color noise, and haze; reduce chromatic aberration. Recover fine detail and sharpen the eyes, eyelashes, eyebrows, lips, individual strands of hair, and clothing texture. Keep natural skin texture with visible pores and realistic detail — do not apply plastic smoothing or airbrushing. Recover lost detail and dynamic range: open up shadows, recover highlights, and add subtle tonal depth. Improve lighting, white balance, local contrast, and color so skin tones look natural and accurate. Keep the person's face, identity, facial features, expression, gaze, pose, hairstyle, clothing, framing, and the background and composition exactly as they are. The result should look like the same photo taken with a much better camera and clean processing — natural, realistic, and photorealistic. Keep everything else unchanged.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: JoyAI Image Edit
- Related generic version: `USR-D03-imgedit-improvePortrait`
- Negative prompt: a negative prompt is used (suppresses altered face, plastic skin, over-smoothed skin, oversharpening, artifacts, etc.)
- Recommended settings: guidance_scale: 4.0; num_inference_steps: 30–50 (40+ for very low-quality sources); basesize: 1024 (buckets 256/512/768/1024); --seed: set a fixed value for reproducibility

# Keywords
portrait enhancement, image quality improvement, sharpening, denoising, JoyAI, image editing, D03
