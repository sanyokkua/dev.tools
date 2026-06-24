import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-D03-restore-portrait',
    categoryCode: 'D03',
    title: 'Repair a Damaged Portrait',
    subtitle: 'Remove scratches, tears, dust, and fading while keeping the exact same person',
    description: 'Remove scratches, tears, dust, and fading while keeping the exact same person',
    variantAxes: ['model'],
    defaultVariantId: 'USR-D03-restore-portrait-nano-banana-pro',
    modeClass: 'chat-only-meta',
    variants: [
        {
            id: 'USR-D03-restore-portrait-nano-banana-pro',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Repair a Damaged Portrait',
            description: 'Repair a Damaged Portrait',
            template: `Edit the provided photograph. Treat it as the source and keep it the SAME photograph — do not regenerate, reinterpret, replace, or re-stage the scene, and do not invent new people or a new setting. This is a damage-repair job, not a makeover or a quality restyle.

Repair only the damage:
- remove scratches, scuff lines, tears, rips, fold and crease lines;
- remove dust specks, dirt, spots, water stains, mildew/mold marks, foxing, surface blemishes;
- reduce film grain and noise to a clean but natural level;
- correct fading, discoloration, uneven exposure, and color shifts so tones look balanced;
- recover lost contrast and detail in shadows and highlights;
- reconstruct small missing or destroyed areas of face, hair, skin, eyes, and clothing plausibly, matching surrounding texture, lighting direction, and grain.

Do NOT change: identity, facial structure or features, expression, age, hairstyle, clothing, pose, composition, lighting mood, background, or era. Do not beautify, slim, smooth, or retouch anyone. No waxy or AI-looking skin, no over-smoothing, no over-sharpening, no warped anatomy, no extra fingers, no distorted eyes. Keep everything else pixel-faithful.
`,
            parameters: [],
            examples: {},
            keywords: ['restore portrait', 'repair damage', 'Nano Banana Pro', 'identity lock', 'img2img', 'D03'],
            executionContext: 'chat',
            model: 'nano-banana-pro',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restore-portrait-gpt-image',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Repair a Damaged Portrait',
            description: 'Repair a Damaged Portrait',
            template: `I'm uploading an old or damaged portrait. Please repair the physical damage only, keeping it the same photograph — do not re-stage the scene or change the person.

Remove the scratches, tears, creases, fold lines, dust, spots, stains, and surface marks; reduce film grain and noise to a natural level; correct fading, discoloration, and uneven exposure; recover detail in shadows and highlights; and plausibly reconstruct any small missing areas of the face, hair, skin, eyes, or clothing using the surrounding texture and light.

Keep the faces exactly as they appear — same eyes, nose, mouth, face shape, expression, and age. Keep the same hairstyle, clothing, pose, composition, lighting mood, background, and era. Don't beautify, smooth, slim, or retouch anyone, and keep natural skin texture (no waxy or plastic look). Don't add or remove anything.
`,
            parameters: [],
            examples: {},
            keywords: ['restore portrait', 'repair damage', 'GPT Image', 'identity lock', 'img2img', 'D03'],
            executionContext: 'chat',
            model: 'gpt-image',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restore-portrait-qwen-image-edit-2511',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Repair a Damaged Portrait',
            description: 'Repair a Damaged Portrait',
            template: `Repair the physical damage on this portrait while preserving the person's identity, expression, and composition.

Positive instruction: Remove scratches, dust, stains, tears, creases, and fading from the portrait. Reduce grain and noise. Reconstruct small missing or torn areas of face, hair, skin, eyes, and clothing using surrounding detail. Recover balanced tones and fine detail. Keep the same person, identical facial features and structure, the same expression, age, hairstyle, clothing, pose, lighting, background, composition, and framing. Keep natural skin texture without plastic smoothing. Repair only — do not beautify, restyle, or rearrange anything.

Negative: scratches, dust, stains, tears, creases, blurry, low quality, jpeg artifacts, noise, deformed, extra fingers, bad anatomy, plastic skin, oversharpened, watermark, text, beautified, different person, altered identity, changed composition.
`,
            parameters: [],
            examples: {},
            keywords: ['restore portrait', 'repair damage', 'Qwen Image Edit 2511', 'negative prompt', 'D03'],
            executionContext: 'chat',
            model: 'qwen-image-edit-2511',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restore-portrait-flux-2',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Repair a Damaged Portrait',
            description: 'Repair a Damaged Portrait',
            template: `Repair this old/damaged portrait in FLUX.2 edit (Kontext) mode with the photo as the input image. Remove all scratches, tears, creases, dust, spots, stains, and fading; reduce grain and noise; reconstruct any small missing or worn detail in the face, hair, skin, eyes, and clothing using the surrounding texture and light; recover balanced contrast and detail in shadows and highlights. Keep the exact same person — same face, identity, expression, age, hairstyle, clothing, pose, composition, camera angle, framing, lighting mood, background, and era. Keep natural skin texture, no plastic smoothing. Repair only — do not beautify or restyle.
`,
            parameters: [],
            examples: {},
            keywords: ['restore portrait', 'repair damage', 'FLUX.2', 'Kontext', 'identity lock', 'D03'],
            executionContext: 'chat',
            model: 'flux-2',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restore-portrait-flux-2-klein',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Repair a Damaged Portrait',
            description: 'Repair a Damaged Portrait',
            template: `Repair this damaged portrait: remove scratches, tears, dust, stains, creases, grain, and fading, and rebuild any small lost detail in the face, hair, and clothing. Keep the exact same person — same face, expression, age, hairstyle, clothing, pose, composition, and framing. Natural skin texture, no plastic smoothing. Repair only, no beautify, no restyle.
`,
            parameters: [],
            examples: {},
            keywords: ['restore portrait', 'repair damage', 'FLUX.2 Klein', 'fast', '4-step', 'D03'],
            executionContext: 'chat',
            model: 'flux-2-klein',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restore-portrait-stable-diffusion',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Repair a Damaged Portrait',
            description: 'Repair a Damaged Portrait',
            template: `## Positive (SDXL — comma-tag)
restored vintage portrait, clean undamaged photograph, original facial features preserved, natural skin texture, sharp eyes, accurate skin tones, intact details, even tonal balance, recovered fine detail, faithful reconstruction, true-to-source lighting, high fidelity, photographic

## Positive (SD 3.5 — natural sentence)
A faithfully restored portrait photograph with all physical damage removed, showing the same person with their original facial features, expression, and natural skin texture intact, balanced tones and recovered fine detail, kept true to the source image.

## Negative
scratches, dust, stains, tears, creases, blurry, low quality, jpeg artifacts, noise, deformed, mutated, extra fingers, bad anatomy, plastic skin, oversharpened, watermark, text, cartoon, 3d render, illustration, beautified, different face, altered identity, changed composition
`,
            parameters: [],
            examples: {},
            keywords: [
                'restore portrait',
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
            id: 'USR-D03-restore-portrait-joyai',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Repair a Damaged Portrait',
            description: 'Repair a Damaged Portrait',
            template: `Carefully repair this old or damaged portrait without changing the person. Remove every scratch, tear, crease, dust speck, spot, stain, and surface mark; reduce grain and noise to a natural level; correct fading and uneven exposure; and gently rebuild any small detail of the face, hair, skin, eyes, or clothing that damage has erased, matching the surrounding texture and light. Keep the same person, the same face, identity, expression, age, hairstyle, clothing, pose, composition, lighting, and background exactly. Keep natural skin texture — no plastic, no beautifying. Repair only.

Negative: \`--neg-prompt scratches, dust, stains, tears, creases, blurry, noise, plastic skin, oversharpening, different person, altered face, beautified, watermark, text\`
`,
            parameters: [],
            examples: {},
            keywords: ['restore portrait', 'repair damage', 'JoyAI', 'negative field', 'D03'],
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
