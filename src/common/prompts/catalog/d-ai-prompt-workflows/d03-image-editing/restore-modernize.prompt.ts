import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-D03-restore-modernize',
    categoryCode: 'D03',
    title: 'Restore & Modernize a Photo',
    subtitle:
        'Full revival — denoise, upscale, deblur, repair, recolor, relight, detail — any old or low-quality photo, identity strictly preserved',
    description:
        'Full revival — denoise, upscale, deblur, repair, recolor, relight, detail — any old or low-quality photo, identity strictly preserved',
    variantAxes: ['model'],
    defaultVariantId: 'USR-D03-restore-modernize-nano-banana-pro',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-D03-restore-modernize-nano-banana-pro',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Restore & Modernize a Photo',
            description: 'Restore & Modernize a Photo',
            template: `Edit the provided photograph. Treat it as the source and keep it the SAME photograph — do not regenerate, reinterpret, replace, or re-stage the scene, and do not invent new people, objects, or setting. In ONE pass, fully revive it so it looks like the exact same scene, with the same people, photographed today on a top-tier modern camera. This is a deep revival, not a light touch-up — but every real element stays pixel-faithful.

Run the full cycle:
- Denoise: remove film grain, sensor noise, and compression artifacts down to a clean, natural level.
- Upscale & deblur: recover crisp resolution and sharp focus; fix motion blur and softness.
- Repair: remove scratches, tears, creases, fold lines, dust, spots, stains, water marks, mold, and fading; reconstruct any missing or worn-away detail seamlessly from surrounding texture and light.
- Recolor (only where needed): if the photo is black-and-white, sepia, faded, or color-shifted, add natural, realistic, era-appropriate color — believable skin tones, natural hair and eye color, period-correct clothing, coherent colors for fabrics, objects, walls, plants, and sky. If the photo already has good color, correct white balance and faded tones rather than recoloring. Keep colors grounded and plausible — no neon, no anachronistic hues.
- Relight: improve white balance, dynamic range, local contrast, and lighting realism; add subtle HDR-like tonal depth.
- Detail: rebuild realistic fine texture — skin pores, hair strands, detailed eyes, fabric weave — keeping skin natural, never plastic or waxy.

STRICTLY preserve: the same people with their exact identities, facial structure, features, expressions, and ages; the same poses, body proportions, hairstyles, and clothing design; the same objects, background, scene layout, composition, camera angle, and framing. Do not add, remove, move, restyle, or invent anyone or anything.
`,
            parameters: [],
            examples: {},
            keywords: [
                'restore modernize',
                'full revival',
                'upscale',
                'deblur',
                'recolor',
                'relight',
                'Nano Banana Pro',
                'identity lock',
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
            id: 'USR-D03-restore-modernize-gpt-image',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Restore & Modernize a Photo',
            description: 'Restore & Modernize a Photo',
            template: `I'm uploading an old, damaged, faded, or low-quality photograph. Please fully revive it in a single pass so it looks like the exact same scene photographed today on a high-end modern camera — a deep revival, not a light touch-up — while keeping the same people and scene exactly.

Run the full cycle: denoise (remove grain, noise, and compression artifacts); upscale and deblur (recover sharp resolution and focus, fix blur and softness); repair (remove scratches, tears, creases, dust, spots, stains, and fading, and reconstruct any missing detail); recolor only where needed (if it's black-and-white, sepia, faded, or color-shifted, add natural era-appropriate color with believable skin tones, period-correct clothing, and coherent background colors; if it already has good color, just correct white balance and faded tones — keep colors grounded, no neon or anachronistic hues); relight (improve white balance, dynamic range, local contrast, and lighting realism with subtle HDR-like depth); and detail (rebuild fine texture — skin pores, hair, eyes, fabric weave — keeping skin natural, no plastic or waxy look).

Keep the faces exactly as they appear — same eyes, nose, mouth, and face shape. Keep the same people, identities, expressions, ages, poses, body proportions, hairstyles, and clothing design; the same objects, background, scene layout, composition, camera angle, and framing. Don't add, remove, move, or restyle anyone or anything.
`,
            parameters: [],
            examples: {},
            keywords: [
                'restore modernize',
                'full revival',
                'upscale',
                'deblur',
                'recolor',
                'GPT Image',
                'identity lock',
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
            id: 'USR-D03-restore-modernize-qwen-image-edit-2511',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Restore & Modernize a Photo',
            description: 'Restore & Modernize a Photo',
            template: `Restore, modernize, and (where needed) colorize this photograph in a single pass. Do all of the following:

Denoise & clean: remove film grain, noise, blur, haze, compression artifacts, and chromatic aberration.
Upscale & deblur: recover crisp resolution, sharp focus, and fine detail.
Repair physical damage: remove scratches, tears, cracks, creases, dust, spots, stains, water marks, mold, and fading; reconstruct missing or torn areas from surrounding detail.
Recolor (only if needed): if the image is black-and-white, sepia, faded, or color-shifted, add natural, realistic, era-appropriate color — coherent skin tones, period-correct clothing, natural environment colors, physically plausible across the whole scene; if color is already good, correct white balance and faded tones instead.
Relight & detail: improve dynamic range, local contrast, white balance, and color accuracy; add clean HDR-like tonal depth and realistic lighting; rebuild realistic fine texture in faces, hair, skin, eyes, clothing, and background so it looks like the exact same scene photographed today on a top-tier modern camera. Keep natural skin texture without plastic smoothing.

Preserve everything real and unchanged: same people, identities, faces, facial structure, expressions, ages, poses, hairstyles, clothing design, accessories, objects, background, scene layout, composition, camera angle, and framing. Do not add, remove, restyle, or rearrange anything — only repair, recolor, and upgrade quality.

Negative: different person, altered face, changed identity, distorted features, plastic skin, oversharpening, monochrome, grayscale, sepia, oversaturated, unnatural colors, color bleeding, extra fingers, deformed hands, added objects, removed objects, changed pose, cartoon, painting, watermark, text.
`,
            parameters: [],
            examples: {},
            keywords: ['restore modernize', 'full revival', 'Qwen Image Edit 2511', 'recolor', 'negative', 'D03'],
            executionContext: 'chat',
            model: 'qwen-image-edit-2511',
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restore-modernize-flux-2',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Restore & Modernize a Photo',
            description: 'Restore & Modernize a Photo',
            template: `Restore and modernize this old, damaged, faded, or low-quality photograph in one pass, run in FLUX.2 edit (Kontext) mode with the photo as the input image, keeping the exact same people, faces, identities, expressions, poses, clothing, objects, background, composition, camera angle, and framing. Denoise and deblur for crisp resolution and sharp focus; repair all scratches, tears, creases, dust, stains, grain, and fading, and reconstruct lost detail. Where the photo is black-and-white, sepia, faded, or color-shifted, add natural, realistic, era-appropriate color — believable skin tones, hair, clothing, environment; where color is already good, correct white balance and faded tones instead. Recover crisp fine texture, accurate white balance, wide dynamic range, real skin pores and fabric weave, no plastic smoothing. Make it look shot today on a Canon 5D Mark IV, 85mm f/1.8, photorealistic. Keep everything else unchanged.
`,
            parameters: [],
            examples: {},
            keywords: ['restore modernize', 'full revival', 'FLUX.2', 'Kontext', 'recolor', 'identity lock', 'D03'],
            executionContext: 'chat',
            model: 'flux-2',
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restore-modernize-flux-2-klein',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Restore & Modernize a Photo',
            description: 'Restore & Modernize a Photo',
            template: `Restore and modernize this old, damaged, faded, or low-quality photo: denoise and deblur for sharp resolution; remove scratches, tears, dust, stains, grain, and fading, and rebuild lost detail. If it's black-and-white, sepia, or faded, add natural, realistic, era-appropriate color (believable skin tones, hair, clothing, background); if it already has color, correct white balance and faded tones. Modernize it to look shot today on a Sony A7IV — sharp fine detail, accurate white balance, wide dynamic range, real skin texture, no plastic smoothing. Keep the exact same people, faces, expressions, poses, clothing, objects, background, composition, and framing unchanged.
`,
            parameters: [],
            examples: {},
            keywords: ['restore modernize', 'full revival', 'FLUX.2 Klein', 'fast', '4-step', 'D03'],
            executionContext: 'chat',
            model: 'flux-2-klein',
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-restore-modernize-stable-diffusion',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Restore & Modernize a Photo',
            description: 'Restore & Modernize a Photo',
            template: `## Positive (SDXL — comma-tag)
restored photograph, fully revived, denoised, deblurred, upscaled, sharp focus, fine detail recovered, damage removed, no scratches, no dust, no tears, no creases, no stains, fading corrected, natural realistic color, era-appropriate colors, realistic skin tones, natural skin texture, detailed eyes, detailed hair, detailed fabric, high dynamic range, balanced contrast, accurate white balance, realistic lighting, clean HDR tonal depth, material realism, fabric metal wood glass foliage, modern flagship camera, DSLR, mirrorless, ultra detailed, photorealistic, professional photo, same person, same face, same pose, same composition, same scene, same background, same framing, same camera angle, identity preserved

## Positive (SD 3.5 — natural sentence)
Fully restore and modernize this old, damaged, faded, or low-quality photograph in a single pass so it looks like the exact same scene photographed today on a top-tier modern camera. Denoise, deblur, and upscale for crisp resolution and sharp focus. Repair all physical damage — remove scratches, tears, creases, dust, spots, stains, and fading, and reconstruct missing detail. Where the image is black-and-white, sepia, or faded, add natural, realistic, era-appropriate color with coherent skin tones, period-correct clothing, and natural background colors; where color is already present, correct white balance and faded tones. Recover sharp fine detail and realistic textures in faces, hair, skin, eyes, and clothing while keeping natural skin texture without plastic smoothing. Improve dynamic range, local contrast, white balance, color accuracy, and lighting realism. Keep the same people, identities, faces, expressions, poses, clothing design, objects, background, scene layout, composition, camera angle, and framing exactly unchanged — only repair, recolor, and upgrade quality.

## Negative
monochrome, grayscale, sepia, scratches, dust, stains, tears, creases, blurry, low quality, jpeg artifacts, noise, deformed, extra fingers, bad anatomy, plastic skin, oversaturated, unnatural colors, watermark, text, cartoon, 3d render, different person, altered face, changed pose
`,
            parameters: [],
            examples: {},
            keywords: [
                'restore modernize',
                'full revival',
                'Stable Diffusion',
                'SDXL',
                'SD 3.5',
                'ControlNet',
                'IP-Adapter-Face',
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
            id: 'USR-D03-restore-modernize-joyai',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Restore & Modernize a Photo',
            description: 'Restore & Modernize a Photo',
            template: `Take this old, damaged, faded, or low-quality photograph and bring it fully back to life in a single pass, as if the very same moment were being photographed today on a top-tier modern camera. Keep the authentic feeling of the original scene, but make it clean, sharp, and alive.

First, denoise and deblur: clean away film grain, noise, blur, haze, and compression, and recover crisp resolution and sharp focus. Then repair every sign of age and damage — remove scratches, tears, cracks, creases, dust, spots, stains, and water marks, and gently rebuild any detail that has been lost or torn away. Where the photo is black-and-white, sepia, or faded, add natural, realistic, era-appropriate color: believable healthy skin tones, period-correct clothing colors, and natural, coherent background colors true to the time and place; where the photo already has color, correct the white balance and revive faded tones instead. Finally, modernize the technical quality — recover sharp fine detail and realistic textures in faces, hair, skin, eyes, and fabric (keeping skin natural, never plastic); improve lighting, dynamic range, local contrast, white balance, and color accuracy for rich, clean depth.

Throughout, keep everything real exactly the same. Do not change the people or their identities, faces, expressions, ages, poses, or hairstyles. Keep the same clothing design, objects, background, scene layout, composition, camera angle, and framing. Do not add, remove, or rearrange anything — only repair it, recolor it where needed, and upgrade its quality. The final result should be photorealistic, with natural colors and realistic skin tones.

Negative: \`--neg-prompt different person, altered face, distorted features, plastic skin, oversharpening, monochrome, grayscale, sepia, oversaturated, unnatural colors, extra fingers, deformed hands, added objects, artifacts, watermark, text\`
`,
            parameters: [],
            examples: {},
            keywords: ['restore modernize', 'full revival', 'JoyAI', 'recolor', 'negative field', 'D03'],
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
