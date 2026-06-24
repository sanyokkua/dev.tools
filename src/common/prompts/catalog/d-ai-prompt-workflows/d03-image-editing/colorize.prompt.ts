import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-D03-colorize',
    categoryCode: 'D03',
    title: 'Colorize a Black-and-White Photo',
    subtitle: 'Add natural, era-appropriate color while keeping faces, composition, and detail identical',
    description: 'Add natural, era-appropriate color while keeping faces, composition, and detail identical',
    variantAxes: ['model'],
    defaultVariantId: 'USR-D03-colorize-nano-banana-pro',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-D03-colorize-nano-banana-pro',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Colorize a Black-and-White Photo',
            description: 'Colorize a Black-and-White Photo',
            template: `Edit the provided black-and-white (or sepia) photograph. Treat it as the source and keep it the SAME photograph — add color only. Do not regenerate, re-stage, sharpen, restyle, or change anything except color.

Add natural, realistic, era-appropriate color:
- believable, healthy skin tones with natural variation;
- period-correct clothing colors;
- coherent, plausible colors for environment, objects, walls, plants, water, and sky;
- physically sensible color distribution across the whole scene, with correct light and shadow.

Do NOT change: the faces, identity, expressions, composition, pose, framing, or any fine detail — keep all of it exactly as it is; change only color. Avoid oversaturated, modern, or neon hues; keep the palette grounded and era-appropriate.
`,
            parameters: [],
            examples: {},
            keywords: [
                'colorize',
                'black and white',
                'era-appropriate color',
                'Nano Banana Pro',
                'structure lock',
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
            id: 'USR-D03-colorize-gpt-image',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Colorize a Black-and-White Photo',
            description: 'Colorize a Black-and-White Photo',
            template: `I'm uploading a black-and-white (or sepia) photo. Please add natural, realistic, era-appropriate color — believable skin tones, period-correct clothing colors, and coherent background colors — while keeping everything else exactly the same.

Keep the faces, identity, expressions, composition, pose, framing, and all fine detail exactly as they are; change only color. Avoid oversaturated, modern, or neon hues — keep the palette grounded and era-appropriate, with sensible light and shadow.
`,
            parameters: [],
            examples: {},
            keywords: [
                'colorize',
                'black and white',
                'era-appropriate color',
                'GPT Image',
                'structure lock',
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
            id: 'USR-D03-colorize-qwen-image-edit-2511',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Colorize a Black-and-White Photo',
            description: 'Colorize a Black-and-White Photo',
            template: `Add natural, realistic, era-appropriate color to this black-and-white (or sepia) photograph while keeping the structure, faces, and composition identical.

Positive instruction: Colorize the photograph with believable, healthy skin tones, period-correct clothing colors, and coherent, physically plausible colors for the environment, objects, and sky, distributed sensibly across the whole scene with correct light and shadow. Keep the faces, identity, expressions, composition, pose, framing, and all fine detail exactly the same — change only color. Keep the palette grounded and era-appropriate, not oversaturated or modern.

Negative: monochrome, sepia, grayscale, oversaturated, unnatural colors, neon colors, modern colors, blurry, low quality, jpeg artifacts, noise, deformed, watermark, text, cartoon, 3d render, changed faces, altered composition.
`,
            parameters: [],
            examples: {},
            keywords: [
                'colorize',
                'black and white',
                'era-appropriate color',
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
            id: 'USR-D03-colorize-flux-2',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Colorize a Black-and-White Photo',
            description: 'Colorize a Black-and-White Photo',
            template: `Colorize this black-and-white (or sepia) photograph in FLUX.2 edit (Kontext) mode with the photo as the input image. Add natural, realistic, era-appropriate color — believable skin tones, period-correct clothing colors, and coherent, plausible colors for the environment, objects, and sky, with sensible light and shadow across the whole scene. Keep the faces, identity, expressions, composition, pose, framing, and all fine detail exactly the same — change only color. Keep the palette grounded and era-appropriate, not oversaturated or modern.
`,
            parameters: [],
            examples: {},
            keywords: [
                'colorize',
                'black and white',
                'era-appropriate color',
                'FLUX.2',
                'Kontext',
                'structure lock',
                'D03',
            ],
            executionContext: 'chat',
            model: 'flux-2',
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-colorize-flux-2-klein',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Colorize a Black-and-White Photo',
            description: 'Colorize a Black-and-White Photo',
            template: `Colorize this black-and-white (or sepia) photo: add natural, realistic, era-appropriate color — believable skin tones, period-correct clothing, coherent environment and sky colors. Keep the faces, composition, pose, and all detail exactly the same; change only color. Keep the palette grounded — no oversaturated, modern, or neon hues.
`,
            parameters: [],
            examples: {},
            keywords: ['colorize', 'black and white', 'era-appropriate color', 'FLUX.2 Klein', 'fast', '4-step', 'D03'],
            executionContext: 'chat',
            model: 'flux-2-klein',
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-colorize-stable-diffusion',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Colorize a Black-and-White Photo',
            description: 'Colorize a Black-and-White Photo',
            template: `## Positive (SDXL — comma-tag)
naturally colorized photograph, realistic era-appropriate colors, accurate skin tones, coherent natural color palette, true-to-period clothing colors, balanced color, photographic, detail preserved, same faces and composition

## Positive (SD 3.5 — natural sentence)
A naturally colorized version of the black-and-white photograph with realistic, era-appropriate colors and accurate skin tones, keeping the faces, composition, and all detail exactly the same. (SD 3.5 tends to give the most coherent color assignments.)

## Negative
monochrome, sepia, grayscale, oversaturated, unnatural colors, neon colors, modern colors, blurry, low quality, jpeg artifacts, noise, deformed, watermark, text, cartoon, 3d render, illustration, changed faces, altered composition
`,
            parameters: [],
            examples: {},
            keywords: [
                'colorize',
                'black and white',
                'era-appropriate color',
                'Stable Diffusion',
                'SDXL',
                'SD 3.5',
                'denoise',
                'ControlNet',
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
            id: 'USR-D03-colorize-joyai',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Colorize a Black-and-White Photo',
            description: 'Colorize a Black-and-White Photo',
            template: `Add natural, realistic, era-appropriate color to this black-and-white (or sepia) photograph without changing anything else. Use believable, healthy skin tones, period-correct clothing colors, and coherent, plausible colors for the environment, objects, walls, plants, water, and sky, distributed sensibly across the whole scene with correct light and shadow. Keep the faces, identity, expressions, composition, pose, framing, and all fine detail exactly the same — change only color. Keep the palette grounded and era-appropriate, not oversaturated, modern, or neon.

Negative: \`--neg-prompt monochrome, sepia, grayscale, oversaturated, unnatural colors, neon colors, modern colors, blurry, noise, changed faces, altered composition, cartoon, 3d render, watermark, text\`
`,
            parameters: [],
            examples: {},
            keywords: ['colorize', 'black and white', 'era-appropriate color', 'JoyAI', 'negative field', 'D03'],
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
