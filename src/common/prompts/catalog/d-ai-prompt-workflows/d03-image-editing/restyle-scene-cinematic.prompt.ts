import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-D03-restyle-scene-cinematic',
    categoryCode: 'D03',
    title: 'Re-style a Scene with a Cinematic Grade',
    subtitle: 'Give a landscape or city photo a film-still look while keeping the content and composition',
    description: 'Give a landscape or city photo a film-still look while keeping the content and composition',
    variantAxes: ['model'],
    defaultVariantId: 'USR-D03-restyle-scene-cinematic-nano-banana-pro',
    modeClass: 'chat-only-meta',
    variants: [
        {
            id: 'USR-D03-restyle-scene-cinematic-nano-banana-pro',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Re-style a Scene with a Cinematic Grade',
            description: 'Re-style a Scene with a Cinematic Grade',
            template: `Edit the provided landscape or cityscape photo. Re-render it as a cinematic film still — this is a deliberate restyle of the color grade and lighting mood, but the scene's content, architecture, and composition must stay exactly the same.

Apply the cinematic look:
- a single professional color grade — choose ONE: teal-and-orange OR warm golden-hour (do not mix);
- soft atmospheric light with gentle haze and depth;
- subtle film grain and a wide, filmic dynamic range;
- dramatic but believable natural lighting, like a frame from a high-end film.

Do NOT change: the composition, perspective, architecture, terrain, content, scene layout, or framing. Do not add or remove buildings, vehicles, signage, people, or any element. Change only the color grade, atmosphere, and lighting mood. Keep it photographic — no cartoon or illustration look, no garish oversaturation.

(Attach the source photo. Output up to 4K; keep the original aspect ratio so nothing is cropped. Refine with follow-ups like "warmer golden-hour grade" or "ease off the grain". Render one grade at a time so you can compare.)
`,
            parameters: [],
            examples: {},
            keywords: [
                'restyle scene',
                'cinematic',
                'color grade',
                'film still',
                'Nano Banana Pro',
                'composition lock',
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
            id: 'USR-D03-restyle-scene-cinematic-gpt-image',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Re-style a Scene with a Cinematic Grade',
            description: 'Re-style a Scene with a Cinematic Grade',
            template: `I'm uploading a landscape or cityscape. Please re-render it as a cinematic film still with a single professional color grade (choose ONE: teal-and-orange OR warm golden-hour), soft atmospheric light, subtle film grain, and a wide filmic dynamic range — change only the grade and lighting mood, keeping the scene exactly the same.

Keep the exact same composition, perspective, architecture, terrain, content, and framing. Don't add or remove buildings, vehicles, signage, people, or any element. Keep it photographic — no cartoon look, no garish oversaturation.

(Set output quality to High and keep the same aspect ratio as the upload so nothing is cropped. Pick one grade per render; refine with "warmer golden-hour" or "less grain". If structures shift, say "keep the exact same composition" and re-run.)
`,
            parameters: [],
            examples: {},
            keywords: [
                'restyle scene',
                'cinematic',
                'color grade',
                'film still',
                'GPT Image',
                'composition lock',
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
            id: 'USR-D03-restyle-scene-cinematic-qwen-image-edit-2511',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Re-style a Scene with a Cinematic Grade',
            description: 'Re-style a Scene with a Cinematic Grade',
            template: `Re-render this landscape/cityscape as a cinematic film still, keeping the exact same content and composition.

Positive instruction: Apply a single professional cinematic color grade — choose ONE: teal-and-orange OR warm golden-hour — with soft atmospheric light, subtle film grain, wide filmic dynamic range, and dramatic believable natural lighting. Keep the exact same composition, perspective, architecture, terrain, content, scene layout, and framing. Change only the grade and lighting mood — add or remove nothing, keep it photographic.

Negative: blurry, low quality, jpeg artifacts, noise, oversharpened, watermark, text, cartoon, 3d render, oversaturated, unnatural colors, changed composition, altered architecture, added elements, removed elements, flat lighting.

Settings: num_inference_steps 40–50; true_cfg_scale 4.0; guidance_scale 1.0 (Lightning LoRA: 4–8 steps, true_cfg ≈1, Euler/Simple). Keep native resolution, up to 2560×2560. This is a restyle so allow the grade and mood to change, but keep true_cfg moderate so composition holds. Pick one grade per render.
`,
            parameters: [],
            examples: {},
            keywords: [
                'restyle scene',
                'cinematic',
                'color grade',
                'film still',
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
            id: 'USR-D03-restyle-scene-cinematic-flux-2',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Re-style a Scene with a Cinematic Grade',
            description: 'Re-style a Scene with a Cinematic Grade',
            template: `Re-render this landscape or cityscape as a cinematic film still in FLUX.2 edit (Kontext) mode with the photo as the input image. Apply a single professional color grade (choose ONE: teal-and-orange OR warm golden-hour), soft atmospheric light, subtle film grain, wide filmic dynamic range, and dramatic believable natural lighting. Keep the exact same composition, perspective, architecture, terrain, content, scene layout, camera angle, and framing. Change only the grade and lighting mood — add or remove nothing.

Settings: run in Kontext / edit mode so the scene geometry stays locked while the grade changes; guidance_scale ≈4; num_inference_steps 28–50. (FLUX uses no negative prompt — express exclusions positively, e.g. "photographic film still, same composition".) Pick one grade per render.
`,
            parameters: [],
            examples: {},
            keywords: [
                'restyle scene',
                'cinematic',
                'color grade',
                'film still',
                'FLUX.2',
                'Kontext',
                'composition lock',
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
            id: 'USR-D03-restyle-scene-cinematic-flux-2-klein',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Re-style a Scene with a Cinematic Grade',
            description: 'Re-style a Scene with a Cinematic Grade',
            template: `Re-render this landscape/cityscape as a cinematic film still: single color grade (choose ONE: teal-and-orange OR warm golden-hour), soft atmospheric light, subtle film grain, wide dynamic range. Keep the exact same composition, perspective, architecture, terrain, content, and framing. Change only the grade and mood — add or remove nothing.

Settings: guidance_scale 1.0; num_inference_steps 4 (raise to 6–12 if the grade looks incomplete); 1024×1024 matched to the source aspect ratio. Klein is best for a fast draft — refine fine detail on a larger model if needed. Pick one grade per render.
`,
            parameters: [],
            examples: {},
            keywords: [
                'restyle scene',
                'cinematic',
                'color grade',
                'film still',
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
            id: 'USR-D03-restyle-scene-cinematic-stable-diffusion',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Re-style a Scene with a Cinematic Grade',
            description: 'Re-style a Scene with a Cinematic Grade',
            template: `## Positive (SDXL — comma-tag)
cinematic landscape photograph, film still, professional camera look, teal and orange color grade, golden hour lighting, soft atmospheric haze, subtle film grain, wide dynamic range, dramatic natural light, anamorphic feel, high detail, photographic, same scene and composition

## Positive (SD 3.5 — natural sentence)
A cinematic film-still version of the same landscape or cityscape with a single professional color grade (teal-and-orange or warm golden-hour), soft atmospheric light, subtle film grain, and wide dynamic range, keeping the exact same content and composition.

## Negative
blurry, low quality, jpeg artifacts, noise, oversharpened, watermark, text, cartoon, 3d render, illustration, oversaturated, unnatural colors, changed composition, altered architecture, added elements, removed elements, flat lighting

## Settings
- Denoising strength 0.6–0.8 (scene restyle — allow a strong grade/mood change).
- CFG 6–8 (SDXL) / 4–7 (SD 3.5); sampler DPM++ 2M Karras, 25–40 steps.
- ControlNet Tile or Depth/Canny (weight 0.6–0.9) to hold composition and architecture while the grade and mood change — essential at this denoise so structures aren't reinvented.
- Pick ONE grade per render (drop "golden hour lighting" if you want pure teal-and-orange, and vice versa).
`,
            parameters: [],
            examples: {},
            keywords: [
                'restyle scene',
                'cinematic',
                'color grade',
                'film still',
                'Stable Diffusion',
                'SDXL',
                'SD 3.5',
                'ControlNet',
                'denoise',
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
            id: 'USR-D03-restyle-scene-cinematic-joyai',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Re-style a Scene with a Cinematic Grade',
            description: 'Re-style a Scene with a Cinematic Grade',
            template: `Re-render this landscape or cityscape as a cinematic film still. Apply a single professional color grade — choose ONE: teal-and-orange OR warm golden-hour — with soft atmospheric light, subtle film grain, a wide filmic dynamic range, and dramatic believable natural lighting. Keep the exact same composition, perspective, architecture, terrain, content, scene layout, and framing. Change only the grade and lighting mood — add or remove nothing, keep it photographic. Pick one grade per render.

Negative: \`--neg-prompt blurry, low quality, noise, oversharpening, cartoon, 3d render, oversaturated, unnatural colors, changed composition, altered architecture, added elements, removed elements, flat lighting, watermark, text\`
Settings: guidance_scale 4.0; num_inference_steps 30–50; basesize 1024; fixed \`--seed\` (so you can compare grades on the same scene); add \`--rewrite-prompt\` for the built-in enhancer.
`,
            parameters: [],
            examples: {},
            keywords: [
                'restyle scene',
                'cinematic',
                'color grade',
                'film still',
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
