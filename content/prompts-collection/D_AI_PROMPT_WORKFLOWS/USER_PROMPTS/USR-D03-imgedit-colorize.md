# Prompt ID
USR-D03-imgedit-colorize

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing

# Description
Single-shot image-editing prompt that adds natural color to a black-and-white image while preserving content, detail, and composition. Attach the source image.

# Prompt
Colorize the black-and-white image. Add natural, plausible color while preserving all content, detail, tonal values, and composition exactly as in the source. Infer realistic colors from context (skin tones, sky, foliage, materials, period-appropriate clothing) and keep them believable and consistent — avoid oversaturation and color bleeding. Do not alter, add, or remove any elements; only add color. The result should read as the same image, naturally colorized.

(Attach the black-and-white source image. Colorization — content locked, only color is added.)

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image.

# Example Values
N/A — attach a black-and-white photo to colorize.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- **Per-model versions:** `../New Image Prompts/<model>/09-colorization.md` (7 models).
- Constraints: content/detail locked; plausible natural color; honesty — AI colorization is inferred, not documentary truth.
- Related: `USR-D03-imgedit-restorePortrait`/`-restoreScene` (often paired with restoration).

# Keywords
image editing, colorize, black and white, natural color, img2img, D03
