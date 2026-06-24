import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-D03-colorize',
    categoryCode: 'D03',
    title: 'Colorize a Black-and-White Photo',
    subtitle: 'Add natural, era-appropriate color while keeping faces, composition, and detail identical',
    description: 'Add natural, era-appropriate color while keeping faces, composition, and detail identical',
    variantAxes: ['model'],
    defaultVariantId: 'USR-D03-colorize-nano-banana-pro',
    modeClass: 'chat-only-meta',
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

(Attach the source photo. Output up to 4K; keep the original aspect ratio so nothing is cropped. Refine with follow-ups like "make the jacket dark navy" or "warmer skin tones". Honesty: AI-added color is plausible reconstruction, not documentary truth — if you actually know a real color, state it so I can apply it.)
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
            isMetaPrompt: true,
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

(Set output quality to High and keep the same aspect ratio as the upload so nothing is cropped. Refine with "make the dress deep red" or "cooler skin tones". Honesty: AI-added color is plausible reconstruction, not documentary truth — tell me any real colors you know and I'll apply them.)
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
            isMetaPrompt: true,
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

Settings: num_inference_steps 40–50; true_cfg_scale 4.0; guidance_scale 1.0 (Lightning LoRA: 4–8 steps, true_cfg ≈1, Euler/Simple). Keep native resolution, up to 2560×2560. Keep true_cfg moderate and the instruction faithful so structure and faces are untouched. Honesty: added color is plausible reconstruction, not documentary truth.
`,
            parameters: [],
            examples: {},
            keywords: [
                'colorize',
                'black and white',
                'era-appropriate color',
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
            id: 'USR-D03-colorize-flux-2',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Colorize a Black-and-White Photo',
            description: 'Colorize a Black-and-White Photo',
            template: `Colorize this black-and-white (or sepia) photograph in FLUX.2 edit (Kontext) mode with the photo as the input image. Add natural, realistic, era-appropriate color — believable skin tones, period-correct clothing colors, and coherent, plausible colors for the environment, objects, and sky, with sensible light and shadow across the whole scene. Keep the faces, identity, expressions, composition, pose, framing, and all fine detail exactly the same — change only color. Keep the palette grounded and era-appropriate, not oversaturated or modern.

Settings: run in Kontext / edit mode so structure and faces stay locked to the source while only color is added; guidance_scale ≈4; num_inference_steps 28–50. (FLUX uses no negative prompt — express exclusions positively, e.g. "natural era-appropriate colors, grounded palette".) Honesty: added color is plausible reconstruction, not documentary truth.
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
            isMetaPrompt: true,
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

Settings: guidance_scale 1.0; num_inference_steps 4 (raise to 6–12 if color is patchy or incomplete); 1024×1024 matched to the source aspect ratio. Klein is best for a fast draft — refine color coherence on a larger model if needed. Honesty: added color is plausible reconstruction, not documentary truth.
`,
            parameters: [],
            examples: {},
            keywords: ['colorize', 'black and white', 'era-appropriate color', 'FLUX.2 Klein', 'fast', '4-step', 'D03'],
            executionContext: 'chat',
            model: 'flux-2-klein',
            isMetaPrompt: true,
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

## Settings
- Denoising strength 0.2–0.3 (LOW — keep structure, faces, and fine detail identical) or use a colorization ControlNet.
- CFG 6–8 (SDXL) / 4–7 (SD 3.5); sampler DPM++ 2M Karras, 25–40 steps.
- ControlNet Tile or a dedicated colorization/recolor ControlNet (preprocessor: none, "My prompt is more important") to keep structure perfectly while only color is added. The SD 3.5 sentence prompt works well here.
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
            isMetaPrompt: true,
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
Settings: guidance_scale 4.0; num_inference_steps 30–50; basesize 1024; fixed \`--seed\`; add \`--rewrite-prompt\` for the built-in enhancer. Honesty: added color is plausible reconstruction, not documentary truth — name any colors you actually know.
`,
            parameters: [],
            examples: {},
            keywords: [
                'colorize',
                'black and white',
                'era-appropriate color',
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
