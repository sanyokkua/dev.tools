import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-D03-improve-portrait',
    categoryCode: 'D03',
    title: 'Improve Portrait Quality',
    subtitle: 'Sharpen and clean an undamaged portrait without changing the person',
    description: 'Sharpen and clean an undamaged portrait without changing the person',
    variantAxes: ['model'],
    defaultVariantId: 'USR-D03-improve-portrait-nano-banana-pro',
    modeClass: 'chat-only-meta',
    variants: [
        {
            id: 'USR-D03-improve-portrait-nano-banana-pro',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Improve Portrait Quality',
            description: 'Improve Portrait Quality',
            template: `Edit the provided portrait. Treat it as the source and keep it the SAME photograph and the SAME person — do not regenerate, replace, or re-stage anyone. There is no physical damage here; this is a quality clean-up, not a repair and not a makeover.

Improve only the technical quality:
- remove blur, softness, compression artifacts, sensor noise, and haze;
- sharpen the eyes, eyelashes, skin, and hair to crisp, natural focus;
- recover fine detail and widen dynamic range in shadows and highlights;
- balance the lighting, white balance, and contrast for a clean, well-exposed result.

Do NOT change: identity, facial structure or features, expression, age, hairstyle, clothing, pose, composition, or background. Do not beautify, slim, smooth, or retouch anyone. Keep natural skin texture with real pores — no waxy or plastic over-smoothing, no over-sharpening, no warped anatomy. Quality only; keep everything else pixel-faithful.

(Attach the source portrait. Output up to 4K; keep the original aspect ratio so nothing is cropped. Refine with follow-ups like "sharpen the eyes a little more" or "the skin looks too smooth — bring back texture".)
`,
            parameters: [],
            examples: {},
            keywords: [
                'improve portrait',
                'enhance',
                'sharpen',
                'denoise',
                'Nano Banana Pro',
                'identity lock',
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
            id: 'USR-D03-improve-portrait-gpt-image',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Improve Portrait Quality',
            description: 'Improve Portrait Quality',
            template: `I'm uploading an undamaged but low-quality portrait — it's soft, noisy, compressed, hazy, or poorly lit. Please improve only the technical quality, keeping it the same photograph and the same person.

Remove the blur, softness, compression artifacts, noise, and haze; sharpen the eyes, skin, and hair to natural crisp focus; recover fine detail and widen dynamic range; and balance the lighting, white balance, and contrast.

Keep the faces exactly as they appear — same eyes, nose, mouth, face shape, expression, and age. Keep the same hairstyle, clothing, pose, composition, and background. Don't beautify, smooth, slim, or retouch anyone, and keep natural skin texture with real pores (no waxy or plastic look). Quality only — don't add, remove, or restyle anything.

(Set output quality to High and keep the same aspect ratio as the upload so nothing is cropped. If it comes back over-smoothed or still soft, say so — e.g. "bring back skin texture" or "sharpen the eyes more".)
`,
            parameters: [],
            examples: {},
            keywords: [
                'improve portrait',
                'enhance',
                'sharpen',
                'denoise',
                'GPT Image',
                'identity lock',
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
            id: 'USR-D03-improve-portrait-qwen-image-edit-2511',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Improve Portrait Quality',
            description: 'Improve Portrait Quality',
            template: `Improve the technical quality of this undamaged portrait while preserving the person's identity, expression, pose, and composition.

Positive instruction: Remove blur, softness, compression artifacts, noise, and haze. Sharpen the eyes, skin, and hair to natural crisp focus. Recover fine detail and widen dynamic range; balance lighting, white balance, and contrast. Keep the same person, identical facial features and structure, the same expression, age, hairstyle, clothing, pose, composition, and background. Keep natural skin texture without plastic smoothing. Quality only — do not beautify, restyle, or change features.

Negative: blurry, low quality, jpeg artifacts, noise, haze, deformed, extra fingers, plastic skin, waxy skin, oversharpened, watermark, text, different face, altered identity, changed pose, over-smoothed, beautified.

Settings: num_inference_steps 40–50; true_cfg_scale 4.0; guidance_scale 1.0 (Lightning LoRA: 4–8 steps, true_cfg ≈1, Euler/Simple). Do NOT downscale the input — keep native resolution, up to 2560×2560. If identity drifts at high steps, lower steps slightly and strengthen the "preserve facial structure" wording.
`,
            parameters: [],
            examples: {},
            keywords: [
                'improve portrait',
                'enhance',
                'sharpen',
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
            id: 'USR-D03-improve-portrait-flux-2',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Improve Portrait Quality',
            description: 'Improve Portrait Quality',
            template: `Improve the quality of this undamaged portrait in FLUX.2 edit (Kontext) mode with the photo as the input image. Remove blur, softness, compression artifacts, noise, and haze; sharpen the eyes, skin, and hair to natural crisp focus; recover fine detail and widen dynamic range; balance lighting, white balance, and contrast. Keep the exact same person — same face, identity, expression, age, hairstyle, clothing, pose, composition, camera angle, framing, and background. Keep natural skin texture with real pores, no plastic smoothing. Quality only — do not beautify or restyle.

Settings: run in Kontext / edit mode so identity and layout stay locked to the source; guidance_scale ≈4; num_inference_steps 28–50. (FLUX uses no negative prompt — express exclusions positively, e.g. "clean sharp image with natural skin texture".)
`,
            parameters: [],
            examples: {},
            keywords: ['improve portrait', 'enhance', 'sharpen', 'FLUX.2', 'Kontext', 'identity lock', 'D03'],
            executionContext: 'chat',
            model: 'flux-2',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-improve-portrait-flux-2-klein',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Improve Portrait Quality',
            description: 'Improve Portrait Quality',
            template: `Improve this undamaged portrait's quality: remove blur, noise, compression, and haze; sharpen the eyes, skin, and hair; recover fine detail and balance the lighting. Keep the exact same person — same face, expression, age, hairstyle, clothing, pose, composition, and framing. Natural skin texture, no plastic smoothing. Quality only, no beautify, no restyle.

Settings: guidance_scale 1.0; num_inference_steps 4 (raise to 6–12 if it still looks soft); 1024×1024 matched to the source aspect ratio. Klein is best for a fast draft — refine fine facial detail on a larger model if needed.
`,
            parameters: [],
            examples: {},
            keywords: ['improve portrait', 'enhance', 'sharpen', 'FLUX.2 Klein', 'fast', '4-step', 'D03'],
            executionContext: 'chat',
            model: 'flux-2-klein',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-improve-portrait-stable-diffusion',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Improve Portrait Quality',
            description: 'Improve Portrait Quality',
            template: `## Positive (SDXL — comma-tag)
high quality portrait, crisp focus, (sharp eyes:1.2), natural skin texture, fine hair detail, clean clear image, accurate skin tones, balanced dynamic range, soft natural lighting, dehazed, denoised, professional photograph, same person, true-to-source identity

## Positive (SD 3.5 — natural sentence)
A clean, high-quality version of the same portrait with crisp focus, sharp eyes, fine hair and skin detail, accurate skin tones, balanced dynamic range, and dehazed, denoised, well-lit rendering, keeping the same person and natural skin texture.

## Negative
blurry, low quality, jpeg artifacts, noise, haze, deformed, extra fingers, plastic skin, waxy skin, oversharpened, watermark, text, cartoon, 3d render, different face, altered identity, changed pose, over-smoothed, beautified

## Settings
- Denoising strength 0.4–0.55 (portraits — high enough to clean and sharpen, low enough to avoid melting the face).
- CFG 6–8 (SDXL) / 4–7 (SD 3.5); sampler DPM++ 2M Karras, 25–40 steps.
- ControlNet Tile (preprocessor: none, "My prompt is more important") to hold structure; IP-Adapter-Face to lock identity; finish with Face Detailer / CodeFormer (w≈0.7) or GFPGAN so the face stays sharp without going waxy.
`,
            parameters: [],
            examples: {},
            keywords: [
                'improve portrait',
                'enhance',
                'sharpen',
                'Stable Diffusion',
                'SDXL',
                'SD 3.5',
                'denoise',
                'ControlNet',
                'IP-Adapter-Face',
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
            id: 'USR-D03-improve-portrait-joyai',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Improve Portrait Quality',
            description: 'Improve Portrait Quality',
            template: `Improve the technical quality of this undamaged portrait without changing the person. Remove blur, softness, noise, compression artifacts, and haze; sharpen the eyes, skin, and hair to natural crisp focus; recover fine detail; widen dynamic range; and balance the lighting, white balance, and contrast. Keep the same person, the same face, identity, expression, age, hairstyle, clothing, pose, composition, and background exactly. Keep natural skin texture with real pores — no plastic, no beautifying, no over-smoothing. Quality only.

Negative: \`--neg-prompt blurry, low quality, noise, haze, plastic skin, waxy skin, oversharpening, over-smoothed, different person, altered face, beautified, changed pose, watermark, text\`
Settings: guidance_scale 4.0; num_inference_steps 30–50; basesize 1024; fixed \`--seed\`; add \`--rewrite-prompt\` for the built-in enhancer.
`,
            parameters: [],
            examples: {},
            keywords: ['improve portrait', 'enhance', 'sharpen', 'JoyAI', 'negative field', 'settings', 'D03'],
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
