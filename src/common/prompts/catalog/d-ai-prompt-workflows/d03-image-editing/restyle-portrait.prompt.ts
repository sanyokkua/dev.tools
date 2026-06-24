import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-D03-restyle-portrait',
    categoryCode: 'D03',
    title: 'Re-style a Portrait as a Professional Camera Shot',
    subtitle: 'Give a casual portrait a studio/editorial look while keeping the exact same face',
    description: 'Give a casual portrait a studio/editorial look while keeping the exact same face',
    variantAxes: ['model'],
    defaultVariantId: 'USR-D03-restyle-portrait-nano-banana-pro',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-D03-restyle-portrait-nano-banana-pro',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Re-style a Portrait as a Professional Camera Shot',
            description: 'Re-style a Portrait as a Professional Camera Shot',
            template: `Edit the provided portrait. Re-render it as a modern, high-end studio / editorial photograph of the SAME person, with identical facial features — this is a deliberate restyle of the lighting, lens look, and backdrop, but the person must stay exactly the same.

Restyle the look:
- soft, flattering key light with a gentle rim light to separate the subject;
- clean, simple studio backdrop (seamless neutral or softly graded);
- 85mm portrait-lens look with shallow depth of field and pleasing background blur;
- polished, professional editorial color and contrast.

Do NOT change: the face, identity, facial structure or features, expression, age, or the person's natural likeness. Keep the same hairstyle and clothing unless lighting naturally affects how they read. Keep natural skin texture with real pores even with editorial polish — no waxy, plastic, or over-retouched look; no beautifying that alters the face shape; no warped anatomy. Change only the lighting, lens rendering, depth of field, and backdrop.
`,
            parameters: [],
            examples: {},
            keywords: [
                'restyle portrait',
                'studio',
                'editorial',
                '85mm',
                'Nano Banana Pro',
                'identity lock',
                'img2img',
                'D03',
            ],
            executionContext: 'chat',
            model: 'nano-banana-pro',
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restyle-portrait-gpt-image',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Re-style a Portrait as a Professional Camera Shot',
            description: 'Re-style a Portrait as a Professional Camera Shot',
            template: `I'm uploading a casual portrait. Please re-render it as a modern, high-end studio / editorial photograph of the same person with identical facial features — change the lighting, lens look, and backdrop, but keep the person exactly the same.

Give it a soft, flattering key light with a gentle rim light; a clean studio backdrop (seamless neutral or softly graded); an 85mm portrait-lens look with shallow depth of field and pleasing background blur; and polished editorial color and contrast.

Keep the face exactly as the same person — same eyes, nose, mouth, face shape, expression, and age. Keep the same hairstyle and clothing. Don't beautify in a way that changes the face, and keep natural skin texture with real pores (no waxy, plastic, or over-retouched look). Change only the lighting, lens rendering, depth of field, and backdrop.
`,
            parameters: [],
            examples: {},
            keywords: [
                'restyle portrait',
                'studio',
                'editorial',
                '85mm',
                'GPT Image',
                'identity lock',
                'img2img',
                'D03',
            ],
            executionContext: 'chat',
            model: 'gpt-image',
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restyle-portrait-qwen-image-edit-2511',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Re-style a Portrait as a Professional Camera Shot',
            description: 'Re-style a Portrait as a Professional Camera Shot',
            template: `Re-render this portrait as a modern high-end studio / editorial photograph of the SAME person, keeping identical facial features and identity.

Positive instruction: Restyle the portrait with a soft flattering key light and gentle rim light, a clean studio backdrop, an 85mm portrait-lens look, shallow depth of field, and polished editorial color and contrast. Keep the exact same person with identical facial structure and features, the same expression, age, hairstyle, and clothing. Keep natural skin texture with real pores even with editorial polish. Change only the lighting, lens rendering, depth of field, and backdrop — do not alter the face, identity, or features.

Negative: blurry, low quality, deformed, extra fingers, plastic skin, waxy skin, oversharpened, watermark, text, cartoon, 3d render, different face, altered identity, distorted features, beautified face shape, busy background.
`,
            parameters: [],
            examples: {},
            keywords: [
                'restyle portrait',
                'studio',
                'editorial',
                '85mm',
                'Qwen Image Edit 2511',
                'negative prompt',
                'D03',
            ],
            executionContext: 'chat',
            model: 'qwen-image-edit-2511',
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restyle-portrait-flux-2',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Re-style a Portrait as a Professional Camera Shot',
            description: 'Re-style a Portrait as a Professional Camera Shot',
            template: `Re-render this portrait as a modern high-end studio / editorial photograph in FLUX.2 edit (Kontext) mode with the photo as the input image, keeping the SAME person with identical facial features. Apply a soft flattering key light with a gentle rim light, a clean studio backdrop, an 85mm portrait-lens look, shallow depth of field, and polished editorial color and contrast. Keep the exact same face, identity, expression, age, hairstyle, and clothing. Keep natural skin texture with real pores even with editorial polish. Change only the lighting, lens rendering, depth of field, and backdrop — do not change the face or features.
`,
            parameters: [],
            examples: {},
            keywords: ['restyle portrait', 'studio', 'editorial', '85mm', 'FLUX.2', 'Kontext', 'identity lock', 'D03'],
            executionContext: 'chat',
            model: 'flux-2',
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restyle-portrait-flux-2-klein',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Re-style a Portrait as a Professional Camera Shot',
            description: 'Re-style a Portrait as a Professional Camera Shot',
            template: `Re-render this portrait as a high-end studio / editorial photo of the SAME person with identical facial features: soft flattering key light, gentle rim light, clean studio backdrop, 85mm lens look, shallow depth of field, polished editorial color. Keep the exact same face, identity, expression, age, hairstyle, and clothing. Natural skin texture, no plastic, no over-retouching. Change only lighting, lens look, and backdrop.
`,
            parameters: [],
            examples: {},
            keywords: ['restyle portrait', 'studio', 'editorial', '85mm', 'FLUX.2 Klein', 'fast', '4-step', 'D03'],
            executionContext: 'chat',
            model: 'flux-2-klein',
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restyle-portrait-stable-diffusion',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Re-style a Portrait as a Professional Camera Shot',
            description: 'Re-style a Portrait as a Professional Camera Shot',
            template: `## Positive (SDXL — comma-tag)
professional studio portrait, editorial headshot, shot on 85mm lens, shallow depth of field, soft key light, clean seamless backdrop, flattering rim light, crisp sharp eyes, natural skin texture, high-end retouching, cinematic color, photographic, same person, preserved facial features

## Positive (SD 3.5 — natural sentence)
A modern high-end studio editorial portrait of the same person with identical facial features, lit with a soft key light and gentle rim light against a clean seamless backdrop, shot with an 85mm lens at shallow depth of field, with polished editorial color and natural skin texture.

## Negative
blurry, low quality, deformed, extra fingers, plastic skin, waxy skin, oversharpened, watermark, text, cartoon, 3d render, different face, altered identity, distorted features, beautified face shape, busy background
`,
            parameters: [],
            examples: {},
            keywords: [
                'restyle portrait',
                'studio',
                'editorial',
                '85mm',
                'Stable Diffusion',
                'SDXL',
                'SD 3.5',
                'IP-Adapter-Face',
                'denoise',
                'D03',
            ],
            executionContext: 'chat',
            model: 'stable-diffusion',
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restyle-portrait-joyai',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Re-style a Portrait as a Professional Camera Shot',
            description: 'Re-style a Portrait as a Professional Camera Shot',
            template: `Re-render this portrait as a modern high-end studio / editorial photograph of the same person, keeping identical facial features. Apply a soft flattering key light with a gentle rim light, a clean studio backdrop, an 85mm portrait-lens look, shallow depth of field, and polished editorial color and contrast. Keep the exact same face, identity, expression, age, hairstyle, and clothing. Keep natural skin texture with real pores even with editorial polish — no plastic, no over-retouching, no change to the face shape. Change only the lighting, lens look, depth of field, and backdrop.

Negative: \`--neg-prompt different person, altered face, distorted features, beautified face shape, plastic skin, waxy skin, oversharpening, busy background, cartoon, watermark, text\`
`,
            parameters: [],
            examples: {},
            keywords: ['restyle portrait', 'studio', 'editorial', '85mm', 'JoyAI', 'negative field', 'D03'],
            executionContext: 'chat',
            model: 'joyai',
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
