import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-D03-cartoon-to-photo',
    categoryCode: 'D03',
    title: 'Convert a Cartoon or Anime to a Real Photo',
    subtitle: 'Render an illustration as a believable photograph while keeping the character and pose',
    description: 'Render an illustration as a believable photograph while keeping the character and pose',
    variantAxes: [],
    defaultVariantId: 'USR-D03-cartoon-to-photo-nano-banana-pro',
    modeClass: 'chat-only-meta',
    variants: [
        {
            id: 'USR-D03-cartoon-to-photo-nano-banana-pro',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Convert a Cartoon or Anime to a Real Photo',
            description: 'Convert a Cartoon or Anime to a Real Photo',
            template: `Edit the provided cartoon or anime image. Re-render it as a believable photorealistic photograph of the SAME character — this is a deliberate medium-change restyle, but the character, pose, and outfit must stay recognizable.

Apply the photographic look:
- realistic human skin texture with real pores and natural tone variation;
- natural fabric, material, and clothing detail;
- true-to-life lighting, shadows, and color;
- accurate, believable anatomy and proportions;
- sharp focus with a natural, shallow depth of field.

Keep the SAME character, the same pose and gesture, the same outfit design and colors, the same hairstyle, and the same overall composition and framing so it reads as the same character photographed for real. Render it as a true photograph — not an illustration, drawing, or 3D render. Aim for natural skin — avoid a plastic, waxy, or doll-like look.

(Attach the source image. Output up to 4K; keep the original aspect ratio so nothing is cropped. Refine with follow-ups like "more realistic skin texture" or "keep the same outfit colors". If proportions look off, ask for "natural human proportions".)
`,
            parameters: [],
            examples: {},
            keywords: [
                'cartoon to photo',
                'anime to photo',
                'restyle',
                'photorealistic',
                'Nano Banana Pro',
                'pose lock',
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
            id: 'USR-D03-cartoon-to-photo-gpt-image',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Convert a Cartoon or Anime to a Real Photo',
            description: 'Convert a Cartoon or Anime to a Real Photo',
            template: `I'm uploading a cartoon or anime image. Please re-render it as a believable photorealistic photograph of the same character in the same pose and outfit — realistic skin texture, natural fabric, true-to-life lighting, accurate anatomy, and a natural shallow depth of field.

Keep the same character, the same pose and gesture, the same outfit design and colors, the same hairstyle, and the same composition and framing so it reads as the same character photographed for real. Render it as a true photograph, not an illustration or 3D render. Keep natural skin texture — avoid a plastic, waxy, or doll-like look.

(Set output quality to High and keep the same aspect ratio as the upload so nothing is cropped. Refine with "more realistic skin texture", "natural human proportions", or "keep the same outfit". If the character changes, say "keep the same character and pose".)
`,
            parameters: [],
            examples: {},
            keywords: [
                'cartoon to photo',
                'anime to photo',
                'restyle',
                'photorealistic',
                'GPT Image',
                'pose lock',
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
            id: 'USR-D03-cartoon-to-photo-qwen-image-edit-2511',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Convert a Cartoon or Anime to a Real Photo',
            description: 'Convert a Cartoon or Anime to a Real Photo',
            template: `Convert this cartoon / anime image into a believable photorealistic photograph while keeping the character, pose, and outfit recognizable.

Positive instruction: Re-render the image as a photorealistic photograph with realistic human skin texture, natural fabric and clothing detail, true-to-life lighting and color, accurate believable anatomy, sharp focus, and a natural shallow depth of field. Keep the same character, the same pose and gesture, the same outfit design and colors, the same hairstyle, and the same composition and framing. Render as a real photo, not an illustration — keep natural skin, no plastic look.

Negative: cartoon, anime, illustration, 3d render, cel shading, drawing, flat colors, line art, blurry, low quality, jpeg artifacts, noise, deformed, extra fingers, bad anatomy, plastic skin, waxy skin, watermark, text, changed pose, different character, altered outfit.

Settings: num_inference_steps 40–50; true_cfg_scale 4.0; guidance_scale 1.0 (Lightning LoRA: 4–8 steps, true_cfg ≈1, Euler/Simple). Keep native resolution, up to 2560×2560. Medium-change restyle — allow the medium to change fully while the pose/outfit/character wording holds the scene.
`,
            parameters: [],
            examples: {},
            keywords: [
                'cartoon to photo',
                'anime to photo',
                'restyle',
                'photorealistic',
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
            id: 'USR-D03-cartoon-to-photo-flux-2',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Convert a Cartoon or Anime to a Real Photo',
            description: 'Convert a Cartoon or Anime to a Real Photo',
            template: `Convert this cartoon / anime image into a believable photorealistic photograph in FLUX.2 edit (Kontext) mode with the image as the input. Render realistic human skin texture, natural fabric and clothing detail, true-to-life lighting and color, accurate believable anatomy, sharp focus, and a natural shallow depth of field. Keep the same character, the same pose and gesture, the same outfit design and colors, the same hairstyle, and the same composition and framing so it reads as the same character photographed for real. Render as a true photograph, not an illustration; keep natural skin texture, no plastic look.

Settings: run in Kontext / edit mode so the pose, outfit, and composition stay anchored to the source while the medium changes; guidance_scale ≈4; num_inference_steps 28–50. (FLUX uses no negative prompt — express exclusions positively, e.g. "photorealistic photograph, natural skin texture, not an illustration".)
`,
            parameters: [],
            examples: {},
            keywords: [
                'cartoon to photo',
                'anime to photo',
                'restyle',
                'photorealistic',
                'FLUX.2',
                'Kontext',
                'pose lock',
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
            id: 'USR-D03-cartoon-to-photo-flux-2-klein',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Convert a Cartoon or Anime to a Real Photo',
            description: 'Convert a Cartoon or Anime to a Real Photo',
            template: `Convert this cartoon / anime image into a believable photorealistic photograph: realistic skin texture, natural fabric, true-to-life lighting, accurate anatomy, shallow depth of field. Keep the same character, pose, outfit, hairstyle, and composition recognizable. Render as a real photo, not an illustration; natural skin, no plastic look.

Settings: guidance_scale 1.0; num_inference_steps 4 (raise to 6–12 if the result still looks drawn); 1024×1024 matched to the source aspect ratio. Klein is best for a fast draft — refine skin and detail on a larger model if needed.
`,
            parameters: [],
            examples: {},
            keywords: [
                'cartoon to photo',
                'anime to photo',
                'restyle',
                'photorealistic',
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
            id: 'USR-D03-cartoon-to-photo-stable-diffusion',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Convert a Cartoon or Anime to a Real Photo',
            description: 'Convert a Cartoon or Anime to a Real Photo',
            template: `## Positive (SDXL — comma-tag)
photorealistic photograph, realistic human, natural skin texture, realistic fabric and clothing detail, true-to-life lighting, accurate anatomy, sharp focus, depth of field, professional photography, same pose and outfit, recognizable character

## Positive (SD 3.5 — natural sentence)
A photorealistic photograph of the same character in the same pose and outfit, with realistic skin texture, natural fabric detail, and true-to-life lighting, rendered as a believable real photo.

## Negative
cartoon, anime, illustration, 3d render, cel shading, drawing, flat colors, line art, blurry, low quality, jpeg artifacts, noise, deformed, mutated, extra fingers, bad anatomy, plastic skin, waxy skin, watermark, text, changed pose, different character, altered outfit

## Settings
- Denoising strength 0.5–0.8 (higher for a stronger conversion to photoreal; lower to stay closer to the original layout).
- CFG 6–8 (SDXL) / 4–7 (SD 3.5); sampler DPM++ 2M Karras, 25–40 steps.
- Use a PHOTOREAL checkpoint (a base photoreal/realistic model, not an anime model).
- ControlNet Lineart (and optionally Depth/Canny, weight 0.6–0.9) to hold the original pose, outfit, and composition while the medium changes. Optionally finish with Face Detailer to keep the face natural (avoid the plastic look at higher denoise).
`,
            parameters: [],
            examples: {},
            keywords: [
                'cartoon to photo',
                'anime to photo',
                'restyle',
                'photorealistic',
                'Stable Diffusion',
                'SDXL',
                'SD 3.5',
                'photoreal checkpoint',
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
            id: 'USR-D03-cartoon-to-photo-joyai',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Convert a Cartoon or Anime to a Real Photo',
            description: 'Convert a Cartoon or Anime to a Real Photo',
            template: `Convert this cartoon / anime image into a believable photorealistic photograph of the same character. Render realistic human skin texture, natural fabric and clothing detail, true-to-life lighting and color, accurate believable anatomy, sharp focus, and a natural shallow depth of field. Keep the same character, the same pose and gesture, the same outfit design and colors, the same hairstyle, and the same composition and framing. Render as a real photo, not an illustration — keep natural skin texture, no plastic or waxy look.

Negative: \`--neg-prompt cartoon, anime, illustration, 3d render, cel shading, drawing, flat colors, line art, blurry, low quality, noise, deformed, extra fingers, bad anatomy, plastic skin, waxy skin, changed pose, different character, altered outfit, watermark, text\`
Settings: guidance_scale 4.0; num_inference_steps 30–50; basesize 1024; fixed \`--seed\`; add \`--rewrite-prompt\` for the built-in enhancer.
`,
            parameters: [],
            examples: {},
            keywords: [
                'cartoon to photo',
                'anime to photo',
                'restyle',
                'photorealistic',
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
