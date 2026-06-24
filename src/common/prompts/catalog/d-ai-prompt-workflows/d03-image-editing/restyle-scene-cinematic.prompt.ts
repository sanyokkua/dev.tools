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
`,
            parameters: [],
            examples: {},
            keywords: ['restyle scene', 'cinematic', 'color grade', 'film still', 'JoyAI', 'negative field', 'D03'],
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
