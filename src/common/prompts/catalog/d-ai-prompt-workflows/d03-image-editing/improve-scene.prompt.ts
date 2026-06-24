import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-D03-improve-scene',
    categoryCode: 'D03',
    title: 'Improve Landscape or Cityscape Quality',
    subtitle: 'Clarify and dehaze an undamaged scene without changing what is in it',
    description: 'Clarify and dehaze an undamaged scene without changing what is in it',
    variantAxes: ['model'],
    defaultVariantId: 'USR-D03-improve-scene-nano-banana-pro',
    modeClass: 'chat-only-meta',
    variants: [
        {
            id: 'USR-D03-improve-scene-nano-banana-pro',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Improve Landscape or Cityscape Quality',
            description: 'Improve Landscape or Cityscape Quality',
            template: `Edit the provided landscape or cityscape photo. Treat it as the source and keep it the SAME photograph and the SAME scene — do not regenerate, replace, or re-stage anything. There is no physical damage; this is a quality clean-up, not a repair and not a restyle.

Improve only the technical quality:
- improve clarity and recover fine detail in foliage, architecture, terrain, water, and sky;
- remove haze and reduce noise to a clean, natural level;
- restore natural, balanced colors and correct white balance;
- sharpen textures and widen dynamic range in shadows and highlights for a clean, well-exposed result.

Do NOT change: the composition, perspective, architecture, terrain, content, or scene layout. Do not add or remove buildings, vehicles, signage, people, or any element, and do not apply a stylistic color grade. Keep colors natural and plausible — no oversaturation, no neon, no over-processing. Quality only; keep everything else faithful.

(Attach the source photo. Output up to 4K; keep the original aspect ratio so nothing is cropped. Refine with follow-ups like "dehaze the distance a bit more" or "the sky looks oversaturated — pull it back".)
`,
            parameters: [],
            examples: {},
            keywords: [
                'improve scene',
                'landscape',
                'cityscape',
                'dehaze',
                'clarity',
                'Nano Banana Pro',
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
            id: 'USR-D03-improve-scene-gpt-image',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Improve Landscape or Cityscape Quality',
            description: 'Improve Landscape or Cityscape Quality',
            template: `I'm uploading an undamaged but low-quality landscape or cityscape — it's soft, hazy, low-contrast, or noisy. Please improve only the technical quality, keeping it the same photograph and the same scene.

Improve clarity and recover fine detail in foliage, architecture, terrain, water, and sky; remove haze; reduce noise; restore natural balanced colors and correct white balance; sharpen textures; and widen dynamic range.

Keep the exact same composition, perspective, architecture, terrain, and content. Don't add or remove buildings, vehicles, signage, people, or any element, and don't apply a stylistic color grade. Keep colors natural — no oversaturation or neon. Quality only.

(Set output quality to High and keep the same aspect ratio as the upload so nothing is cropped. If colors come out too punchy or it's still hazy, say so — e.g. "more dehaze, keep colors natural".)
`,
            parameters: [],
            examples: {},
            keywords: ['improve scene', 'landscape', 'cityscape', 'dehaze', 'clarity', 'GPT Image', 'img2img', 'D03'],
            executionContext: 'chat',
            model: 'gpt-image',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-improve-scene-qwen-image-edit-2511',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Improve Landscape or Cityscape Quality',
            description: 'Improve Landscape or Cityscape Quality',
            template: `Improve the technical quality of this undamaged landscape/cityscape while preserving the exact scene, composition, and content.

Positive instruction: Improve clarity and recover fine detail in foliage, architecture, terrain, water, and sky. Remove haze, reduce noise, restore natural balanced colors, correct white balance, sharpen textures, and widen dynamic range. Keep the exact same composition, perspective, architecture, terrain, and content. Quality only — add or remove nothing, apply no color grade, keep colors natural and not oversaturated.

Negative: blurry, low quality, jpeg artifacts, noise, haze, oversharpened, watermark, text, cartoon, 3d render, oversaturated, unnatural colors, changed composition, altered architecture, added elements, removed elements.

Settings: num_inference_steps 40–50; true_cfg_scale 4.0; guidance_scale 1.0 (Lightning LoRA: 4–8 steps, true_cfg ≈1, Euler/Simple). Do NOT downscale the input — keep native resolution, up to 2560×2560. Keep true_cfg moderate so scene geometry is respected.
`,
            parameters: [],
            examples: {},
            keywords: [
                'improve scene',
                'landscape',
                'cityscape',
                'dehaze',
                'clarity',
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
            id: 'USR-D03-improve-scene-flux-2',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Improve Landscape or Cityscape Quality',
            description: 'Improve Landscape or Cityscape Quality',
            template: `Improve the quality of this undamaged landscape or cityscape in FLUX.2 edit (Kontext) mode with the photo as the input image. Improve clarity and recover fine detail in foliage, architecture, terrain, water, and sky; remove haze; reduce noise; restore natural balanced colors and correct white balance; sharpen textures; widen dynamic range. Keep the exact same composition, perspective, architecture, terrain, content, camera angle, and framing. Quality only — add or remove nothing, apply no color grade, keep colors natural.

Settings: run in Kontext / edit mode so the scene geometry and layout stay locked to the source; guidance_scale ≈4; num_inference_steps 28–50. (FLUX uses no negative prompt — express exclusions positively, e.g. "clear well-exposed scene with natural colors".)
`,
            parameters: [],
            examples: {},
            keywords: ['improve scene', 'landscape', 'cityscape', 'dehaze', 'clarity', 'FLUX.2', 'Kontext', 'D03'],
            executionContext: 'chat',
            model: 'flux-2',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-improve-scene-flux-2-klein',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Improve Landscape or Cityscape Quality',
            description: 'Improve Landscape or Cityscape Quality',
            template: `Improve this undamaged landscape/cityscape's quality: improve clarity and fine detail, remove haze, reduce noise, restore natural balanced colors, sharpen textures, and widen dynamic range. Keep the exact same composition, perspective, architecture, terrain, and content. Quality only — add or remove nothing, no color grade, keep colors natural.

Settings: guidance_scale 1.0; num_inference_steps 4 (raise to 6–12 if it still looks soft or hazy); 1024×1024 matched to the source aspect ratio. Klein is best for a fast draft — refine fine detail on a larger model if needed.
`,
            parameters: [],
            examples: {},
            keywords: [
                'improve scene',
                'landscape',
                'cityscape',
                'dehaze',
                'clarity',
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
            id: 'USR-D03-improve-scene-stable-diffusion',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Improve Landscape or Cityscape Quality',
            description: 'Improve Landscape or Cityscape Quality',
            template: `## Positive (SDXL — comma-tag)
high quality landscape photograph, crisp clarity, fine detail in foliage and architecture, balanced dynamic range, dehazed, natural accurate colors, sharp textures, clean clear sky, well-exposed, denoised, professional photograph, true-to-source composition

## Positive (SD 3.5 — natural sentence)
A clean, high-quality version of the same landscape or cityscape with crisp clarity, fine detail in foliage and architecture, dehazed atmosphere, natural accurate colors, sharp textures, and balanced dynamic range, keeping the exact same composition and content.

## Negative
blurry, low quality, jpeg artifacts, noise, haze, oversharpened, watermark, text, cartoon, 3d render, oversaturated, unnatural colors, changed composition, altered architecture, added elements, removed elements

## Settings
- Denoising strength 0.2–0.45 (LOW — quality only, not restyle; raise gradually only where needed).
- CFG 6–8 (SDXL) / 4–7 (SD 3.5); sampler DPM++ 2M Karras, 25–40 steps.
- ControlNet Tile (preprocessor: none, "My prompt is more important") to hold composition while adding clarity and detail.
`,
            parameters: [],
            examples: {},
            keywords: [
                'improve scene',
                'landscape',
                'cityscape',
                'dehaze',
                'clarity',
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
            id: 'USR-D03-improve-scene-joyai',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Improve Landscape or Cityscape Quality',
            description: 'Improve Landscape or Cityscape Quality',
            template: `Improve the technical quality of this undamaged landscape or cityscape without changing the scene. Improve clarity and recover fine detail in foliage, architecture, terrain, water, and sky; remove haze; reduce noise; restore natural balanced colors and correct white balance; sharpen textures; and widen dynamic range. Keep the exact same composition, perspective, architecture, terrain, and content. Add or remove nothing, apply no color grade, keep colors natural and not oversaturated. Quality only.

Negative: \`--neg-prompt blurry, low quality, noise, haze, oversharpening, oversaturated, unnatural colors, changed composition, altered architecture, added elements, removed elements, watermark, text\`
Settings: guidance_scale 4.0; num_inference_steps 30–50; basesize 1024; fixed \`--seed\`; add \`--rewrite-prompt\` for the built-in enhancer.
`,
            parameters: [],
            examples: {},
            keywords: [
                'improve scene',
                'landscape',
                'cityscape',
                'dehaze',
                'clarity',
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
