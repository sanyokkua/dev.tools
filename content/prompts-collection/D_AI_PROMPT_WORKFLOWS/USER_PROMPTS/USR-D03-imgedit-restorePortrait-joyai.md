# Prompt ID
USR-D03-imgedit-restorePortrait-joyai

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (JoyAI Image Edit)

# Description
Repair physical damage in an old or damaged portrait while keeping the person's identity, expression, and composition exactly the same. Use when you have a scanned or aged portrait with scratches, tears, dust, creases, fading, stains, or heavy noise that needs faithful restoration (not beautification).

# Prompt
Restore the damaged portrait in this image to its original condition. Repair all physical damage: remove scratches, tears, rips, creases, fold lines, dust spots, specks, stains, water marks, mold, and chemical discoloration. Reduce film grain and scanning noise while keeping authentic photographic texture. Reconstruct any missing or torn areas by plausibly extending the surrounding detail (skin, hair, clothing, background) so the repair is seamless. Correct fading and uneven exposure: restore lost contrast, recover detail in shadows and highlights, and rebalance brightness for a clean, natural look. Keep the person's face, identity, age, facial features, expression, gaze, pose, hairstyle, clothing, and the overall composition and framing exactly as they are — do not beautify, reshape, restyle, or change anyone. Preserve the original era and period details. The result should look like a well-preserved version of the same photograph, natural and realistic, not retouched or modernized. Keep everything else unchanged.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: JoyAI Image Edit
- Related generic version: `USR-D03-imgedit-restorePortrait`
- Negative prompt: a negative prompt is used (suppresses altered face, beautified skin, oversharpening, artifacts, etc.)
- Recommended settings: guidance_scale: 4.0; num_inference_steps: 30–50 (use 40+ for badly damaged scans); basesize: 1024 (buckets 256/512/768/1024); --seed: set a fixed value for reproducibility

# Keywords
portrait restoration, damage repair, scratch removal, photo repair, JoyAI, image editing, D03
