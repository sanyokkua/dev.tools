# Prompt ID
USR-D03-imgedit-restoreScene

# Domain / Category
D — AI & Prompt Workflows / D03 Image Editing

# Description
Single-shot image-editing prompt that restores a damaged or old nature/city photo while preserving the scene's content and composition. Attach the source photo.

# Prompt
Restore the nature/city photograph in this image. Repair physical damage — scratches, tears, creases, stains, fading, dust, and missing regions — and reduce noise and haze, while keeping the scene EXACTLY as it is. Preserve all structures, landscape, objects, layout, perspective, framing, and composition precisely as in the source. Reconstruct only damaged areas, inferring plausibly from surrounding intact detail. Keep textures natural and realistic; do not add, remove, or rearrange elements, and do not over-process. The result should read as the same photograph, faithfully repaired.

(Attach the source photo. This is restoration, not restyling — stay faithful to the original.)

# Parameters
None — fixed-content, single-shot prompt. Input is the attached image.

# Example Values
N/A — attach a damaged/old landscape or city photo.

# Notes
- Recommended system prompt: `SYS-D03-image-editing` (optional).
- **Per-model versions:** `USR-D03-imgedit-restoreScene-nanoBananaPro`, `USR-D03-imgedit-restoreScene-gptImage`, `USR-D03-imgedit-restoreScene-qwenImageEdit`, `USR-D03-imgedit-restoreScene-flux2`, `USR-D03-imgedit-restoreScene-flux2Klein`, `USR-D03-imgedit-restoreScene-stableDiffusion`, `USR-D03-imgedit-restoreScene-joyai`
- Constraints: lock scene/composition; repair only; honesty about invented detail.
- Related: `USR-D03-imgedit-improveScene`, `USR-D03-imgedit-colorize`.

# Keywords
image editing, restoration, landscape, city, repair, img2img, D03
