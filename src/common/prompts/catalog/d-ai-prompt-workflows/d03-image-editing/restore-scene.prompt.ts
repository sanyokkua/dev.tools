import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-D03-restore-scene',
    categoryCode: 'D03',
    title: 'Repair a Damaged Landscape or Cityscape',
    subtitle: 'Remove damage from an old nature or city photo while preserving the era-accurate scene',
    description: 'Remove damage from an old nature or city photo while preserving the era-accurate scene',
    variantAxes: ['model'],
    defaultVariantId: 'USR-D03-restore-scene-nano-banana-pro',
    modeClass: 'chat-only-meta',
    variants: [
        {
            id: 'USR-D03-restore-scene-nano-banana-pro',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Repair a Damaged Landscape or Cityscape',
            description: 'Repair a Damaged Landscape or Cityscape',
            template: `Edit the provided photograph of a landscape or cityscape. Treat it as the source and keep it the SAME photograph — do not regenerate, reinterpret, replace, or re-stage the scene, and do not invent new structures, vehicles, signage, or people. This is a damage-repair job, not a makeover or a modernization.

Repair only the damage:
- remove scratches, scuff lines, tears, rips, fold and crease lines;
- remove dust specks, dirt, spots, water stains, mildew/mold marks, foxing, surface blemishes;
- reduce film grain and noise to a clean but natural level;
- correct fading, discoloration, uneven exposure, and color shifts so tones look balanced;
- recover lost contrast and detail in foliage, architecture, terrain, water, and sky;
- reconstruct small missing or destroyed areas plausibly, matching surrounding texture, lighting direction, perspective, and grain.

Do NOT change: the composition, horizon line, perspective, architecture, terrain, period/era detail, scene layout, framing, or lighting mood. Do not add modern buildings, signage, vehicles, wires, or any anachronistic element, and do not remove or move anything that is genuinely in the scene. Keep textures natural and realistic; no over-processing, no over-sharpening, no plastic look. Keep everything else pixel-faithful.

(Attach the source photo. Output up to 4K; keep the original aspect ratio so nothing is cropped. Refine with follow-ups like "there is still a crease across the sky" or "recover more detail in the building facade". Note: reconstructed detail is plausible inference, not documentary truth.)
`,
            parameters: [],
            examples: {},
            keywords: [
                'restore scene',
                'landscape',
                'cityscape',
                'repair damage',
                'Nano Banana Pro',
                'era preserved',
                'img2img',
                'D03',
            ],
            executionContext: 'chat',
            model: 'nano-banana-pro',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restore-scene-gpt-image',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Repair a Damaged Landscape or Cityscape',
            description: 'Repair a Damaged Landscape or Cityscape',
            template: `I'm uploading an old or damaged landscape or cityscape photo. Please repair the physical damage only, keeping it the same photograph — do not re-stage the scene, modernize it, or add or remove anything.

Remove the scratches, tears, creases, fold lines, dust, spots, stains, and surface marks; reduce film grain and noise to a natural level; correct fading, discoloration, and uneven exposure; recover detail in foliage, architecture, terrain, water, and sky; and plausibly reconstruct any small missing areas using the surrounding texture, light, and perspective.

Keep the composition, horizon, perspective, architecture, terrain, era detail, scene layout, framing, and lighting mood exactly as they are. Don't add modern buildings, signage, vehicles, wires, or any anachronistic element. Keep textures natural and realistic — no over-processing or plastic look.

(Set output quality to High and keep the same aspect ratio as the upload so nothing is cropped. If a defect remains, point at it specifically — e.g. "there's still a scratch across the rooftop". Reconstructed detail is plausible inference, not documentary truth.)
`,
            parameters: [],
            examples: {},
            keywords: [
                'restore scene',
                'landscape',
                'cityscape',
                'repair damage',
                'GPT Image',
                'era preserved',
                'img2img',
                'D03',
            ],
            executionContext: 'chat',
            model: 'gpt-image',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restore-scene-qwen-image-edit-2511',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Repair a Damaged Landscape or Cityscape',
            description: 'Repair a Damaged Landscape or Cityscape',
            template: `Repair the physical damage on this landscape/cityscape photograph while preserving the scene's content, composition, and era exactly.

Positive instruction: Remove scratches, dust, stains, tears, creases, and fading from the photograph. Reduce grain and noise. Reconstruct small missing or torn areas in foliage, architecture, terrain, water, and sky using surrounding detail and perspective. Recover balanced tones, contrast, and fine detail. Keep the exact same composition, horizon, perspective, architecture, terrain, period/era detail, scene layout, framing, and lighting mood. Repair only — add nothing modern, remove nothing, do not restyle or rearrange the scene.

Negative: scratches, dust, stains, tears, creases, blurry, low quality, jpeg artifacts, noise, oversharpened, watermark, text, modern additions, added buildings, added vehicles, added signage, changed composition, altered architecture, unnatural colors.

Settings: num_inference_steps 40–50; true_cfg_scale 4.0; guidance_scale 1.0 (Lightning LoRA: 4–8 steps, true_cfg ≈1, Euler/Simple). Do NOT downscale the input — keep native resolution, up to 2560×2560. Keep true_cfg moderate so the model respects the original scene geometry.
`,
            parameters: [],
            examples: {},
            keywords: [
                'restore scene',
                'landscape',
                'cityscape',
                'repair damage',
                'Qwen Image Edit 2511',
                'negative prompt',
                'settings',
                'D03',
            ],
            executionContext: 'chat',
            model: 'qwen-image-edit-2511',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restore-scene-flux-2',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Repair a Damaged Landscape or Cityscape',
            description: 'Repair a Damaged Landscape or Cityscape',
            template: `Repair this old/damaged landscape or cityscape in FLUX.2 edit (Kontext) mode with the photo as the input image. Remove all scratches, tears, creases, dust, spots, stains, and fading; reduce grain and noise; reconstruct any small missing or worn detail in foliage, architecture, terrain, water, and sky using the surrounding texture, light, and perspective; recover balanced contrast and detail in shadows and highlights. Keep the exact same composition, horizon, perspective, architecture, terrain, period/era detail, scene layout, framing, and lighting mood. Repair only — add no modern buildings, signage, or vehicles, remove nothing, do not restyle.

Settings: run in Kontext / edit mode so the scene geometry and layout stay locked to the source; guidance_scale ≈4; num_inference_steps 28–50. (FLUX uses no negative prompt — express exclusions positively, e.g. "clean undamaged sky with even tone".)
`,
            parameters: [],
            examples: {},
            keywords: [
                'restore scene',
                'landscape',
                'cityscape',
                'repair damage',
                'FLUX.2',
                'Kontext',
                'era preserved',
                'D03',
            ],
            executionContext: 'chat',
            model: 'flux-2',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restore-scene-flux-2-klein',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Repair a Damaged Landscape or Cityscape',
            description: 'Repair a Damaged Landscape or Cityscape',
            template: `Repair this damaged landscape/cityscape: remove scratches, tears, dust, stains, creases, grain, and fading, and rebuild any small lost detail in foliage, architecture, terrain, and sky. Keep the exact same composition, horizon, perspective, architecture, era detail, scene layout, and framing. Repair only — add nothing modern, remove nothing, no restyle.

Settings: guidance_scale 1.0; num_inference_steps 4 (raise to 6–12 if damage remains); 1024×1024 matched to the source aspect ratio. Klein is best for a fast draft — refine fine detail on a larger model if needed.
`,
            parameters: [],
            examples: {},
            keywords: [
                'restore scene',
                'landscape',
                'cityscape',
                'repair damage',
                'FLUX.2 Klein',
                'fast',
                '4-step',
                'D03',
            ],
            executionContext: 'chat',
            model: 'flux-2-klein',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restore-scene-stable-diffusion',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Repair a Damaged Landscape or Cityscape',
            description: 'Repair a Damaged Landscape or Cityscape',
            template: `## Positive (SDXL — comma-tag)
restored landscape photograph, clean undamaged scene, recovered detail in foliage and architecture, balanced contrast, intact sky gradient, accurate period detail, even exposure, true-to-source colors, faithful reconstruction, sharp natural textures, high fidelity, photographic, same composition and perspective

## Positive (SD 3.5 — natural sentence)
A faithfully restored landscape or cityscape photograph with all physical damage removed, recovered detail in foliage, architecture, terrain, and sky, balanced contrast and even exposure, true-to-source colors, kept exactly the same in composition, perspective, and period detail.

## Negative
scratches, dust, stains, tears, creases, blurry, low quality, jpeg artifacts, noise, oversharpened, watermark, text, cartoon, 3d render, illustration, modern additions, added buildings, added vehicles, changed composition, altered architecture, unnatural colors

## Settings
- Denoising strength 0.2–0.45 (LOW — repair, not restyle; raise gradually only where damage persists).
- CFG 6–8 (SDXL) / 4–7 (SD 3.5); sampler DPM++ 2M Karras, 25–40 steps.
- ControlNet Tile (preprocessor: none, "My prompt is more important") to hold composition and recover faithful detail while keeping scene geometry locked.
`,
            parameters: [],
            examples: {},
            keywords: [
                'restore scene',
                'landscape',
                'cityscape',
                'repair damage',
                'Stable Diffusion',
                'SDXL',
                'SD 3.5',
                'denoise',
                'ControlNet',
                'D03',
            ],
            executionContext: 'chat',
            model: 'stable-diffusion',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restore-scene-joyai',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Repair a Damaged Landscape or Cityscape',
            description: 'Repair a Damaged Landscape or Cityscape',
            template: `Carefully repair this old or damaged landscape or cityscape photograph without changing the scene. Remove every scratch, tear, crease, dust speck, spot, stain, and surface mark; reduce grain and noise to a natural level; correct fading and uneven exposure; and gently rebuild any small detail of foliage, architecture, terrain, water, or sky that damage has erased, matching the surrounding texture, light, and perspective. Keep the exact same composition, horizon, perspective, architecture, terrain, period detail, scene layout, and framing. Add nothing modern, remove nothing, do not restyle — repair only.

Negative: \`--neg-prompt scratches, dust, stains, tears, creases, blurry, noise, oversharpening, modern additions, added buildings, added vehicles, changed composition, altered architecture, unnatural colors, watermark, text\`
Settings: guidance_scale 4.0; num_inference_steps 30–50 (use 40+ for badly damaged scans); basesize 1024; fixed \`--seed\`; add \`--rewrite-prompt\` for the built-in enhancer.
`,
            parameters: [],
            examples: {},
            keywords: [
                'restore scene',
                'landscape',
                'cityscape',
                'repair damage',
                'JoyAI',
                'negative field',
                'settings',
                'D03',
            ],
            executionContext: 'chat',
            model: 'joyai',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
