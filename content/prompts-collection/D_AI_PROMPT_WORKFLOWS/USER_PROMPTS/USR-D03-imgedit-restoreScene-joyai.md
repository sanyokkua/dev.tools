# Prompt ID
USR-D03-imgedit-restoreScene-joyai

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing (JoyAI Image Edit)

# Description
Repair physical damage in an old or damaged landscape or cityscape photo while preserving the scene, composition, and era exactly. Use when you have a scanned or aged nature/city photo with scratches, dust, creases, fading, or stains that needs faithful restoration (not modernization).

# Prompt
Restore the damaged landscape or cityscape in this image to its original condition. Repair all physical damage: remove scratches, tears, creases, fold lines, dust, specks, stains, water marks, mold, and chemical discoloration. Reduce scanning noise and grain while keeping authentic photographic texture. Reconstruct missing or torn regions by plausibly continuing the surrounding content — recover fine detail in foliage, trees, grass, water, rock, soil, building facades, windows, rooftops, streets, and sky. Correct fading and uneven exposure: rebalance contrast, recover detail in dark shadows and blown-out skies, and even out brightness for a clean, natural result. Keep the composition, framing, horizon line, perspective, and all structures and natural elements exactly where they are. Preserve the original era, architectural style, vehicles, signage, and period details — do not modernize or add anything new. The result should look like a well-preserved version of the same photograph, natural and realistic. Keep everything else unchanged.

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image (no text parameters).

# Example Values
N/A — attach the source image.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- Model: JoyAI Image Edit
- Related generic version: `USR-D03-imgedit-restoreScene`
- Negative prompt: a negative prompt is used (suppresses changed composition, modernized elements, distorted perspective, artifacts, etc.)
- Recommended settings: guidance_scale: 4.0; num_inference_steps: 30–50 (use 40+ for heavily damaged scans); basesize: 1024 (buckets 256/512/768/1024); --seed: set a fixed value for reproducibility

# Keywords
landscape restoration, cityscape repair, scene damage repair, photo restoration, JoyAI, image editing, D03
