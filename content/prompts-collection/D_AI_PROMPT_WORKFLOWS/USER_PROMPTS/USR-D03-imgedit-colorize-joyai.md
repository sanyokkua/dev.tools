# Prompt ID
USR-D03-imgedit-colorize-joyai

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (JoyAI Image Edit)

# Description
Add natural, era-appropriate color to a black-and-white photo while keeping faces, composition, and detail identical. Use when you have a grayscale or sepia photo you want colorized realistically without changing anything else.

# Prompt
Colorize the black-and-white photograph in this image with natural, realistic, era-appropriate color. Add believable color to every element: render natural skin tones for all faces and hands, realistic hair colors, true-to-life colors for clothing and fabrics, and natural colors for the background, foliage, sky, water, architecture, and any objects. Keep the colors coherent and physically plausible across the whole image, with consistent lighting and white balance, and choose tones appropriate to the period and setting of the photo. Do not change anything except color: keep every face, identity, expression, pose, object, structure, texture, fine detail, framing, and the overall composition exactly identical to the original. Do not alter brightness or contrast beyond what is needed for natural color, and do not over-saturate. The result should look like a genuine color photograph of the same scene — natural, subtle, and realistic. Keep faces, composition, and detail identical.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: JoyAI Image Edit
- Related generic version: `USR-D03-imgedit-colorize`
- Negative prompt: a negative prompt is used (suppresses monochrome, oversaturated, unnatural colors, color bleeding, changed faces/composition, etc.)
- Recommended settings: guidance_scale: 4.0; num_inference_steps: 30–50 (40+ for more refined, even color); basesize: 1024 (buckets 256/512/768/1024); --seed: set a fixed value for reproducibility

# Keywords
colorization, black and white to color, photo colorizing, era-appropriate color, JoyAI, image editing, D03
