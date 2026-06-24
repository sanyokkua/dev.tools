import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-D03-photo-to-anime',
    categoryCode: 'D03',
    title: 'Convert a Photo to Anime or Cartoon',
    subtitle: 'Render a real photo as an anime/cartoon illustration while keeping the pose and composition',
    description: 'Render a real photo as an anime/cartoon illustration while keeping the pose and composition',
    variantAxes: ['model'],
    defaultVariantId: 'USR-D03-photo-to-anime-nano-banana-pro',
    modeClass: 'chat-only-meta',
    variants: [
        {
            id: 'USR-D03-photo-to-anime-nano-banana-pro',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Convert a Photo to Anime or Cartoon',
            description: 'Convert a Photo to Anime or Cartoon',
            template: `Edit the provided photograph. Re-render it as an anime / cartoon illustration — this is a deliberate medium-change restyle, but the same subject, pose, and composition must stay recognizable.

Apply the anime/cartoon look:
- clean, confident line art;
- cel shading with flat color regions and crisp shadow shapes;
- vibrant, saturated flat colors;
- expressive, stylized anime eyes and hair, with simplified but recognizable features.

Keep the SAME subject, the same pose and gesture, the same number of people, the same clothing design, and the same overall composition and framing so it's clearly the same scene re-drawn. Do not change who is in the picture, where they are, or what they're doing. Render it as an illustration — not a photorealistic image.

(Attach the source photo. Output up to 4K; keep the original aspect ratio so nothing is cropped. Refine with follow-ups like "stronger cel shading" or "make the line art cleaner". You can dial the stylization up or down by asking for "more stylized" / "closer to the photo".)
`,
            parameters: [],
            examples: {},
            keywords: [
                'photo to anime',
                'cartoon',
                'restyle',
                'cel shading',
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
            id: 'USR-D03-photo-to-anime-gpt-image',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Convert a Photo to Anime or Cartoon',
            description: 'Convert a Photo to Anime or Cartoon',
            template: `I'm uploading a real photo. Please re-render it as an anime / cartoon illustration — clean line art, cel shading, vibrant flat colors, and expressive stylized eyes and hair — while keeping the same subject, pose, and composition recognizable.

Keep the same subject(s), the same pose and gesture, the same clothing design, and the same overall composition and framing so it reads as the same scene re-drawn as anime. Don't change who is in the picture or what they're doing. Render it clearly as an illustration, not a photorealistic image.

(Set output quality to High and keep the same aspect ratio as the upload so nothing is cropped. Refine with "stronger cel shading", "cleaner line art", or "more stylized eyes". If the pose drifts, say "keep the same pose and composition".)
`,
            parameters: [],
            examples: {},
            keywords: [
                'photo to anime',
                'cartoon',
                'restyle',
                'cel shading',
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
            id: 'USR-D03-photo-to-anime-qwen-image-edit-2511',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Convert a Photo to Anime or Cartoon',
            description: 'Convert a Photo to Anime or Cartoon',
            template: `Convert this photograph into an anime / cartoon illustration while keeping the subject, pose, and composition recognizable.

Positive instruction: Re-render the image as an anime/cartoon illustration with clean line art, cel shading, vibrant flat colors, and expressive stylized anime eyes and hair. Keep the same subject(s), the same pose and gesture, the same clothing design, and the same overall composition and framing. Render as an illustration, not a photo — but keep it clearly the same scene re-drawn.

Negative: photorealistic, realistic, photo, 3d render, blurry, low quality, jpeg artifacts, noise, deformed, extra fingers, bad anatomy, watermark, text, oversaturated, changed pose, changed composition, different subject.

Settings: num_inference_steps 40–50; true_cfg_scale 4.0; guidance_scale 1.0 (Lightning LoRA: 4–8 steps, true_cfg ≈1, Euler/Simple). Keep native resolution, up to 2560×2560. This is a medium-change restyle — allow the medium to change fully while the pose and composition wording hold the scene.
`,
            parameters: [],
            examples: {},
            keywords: [
                'photo to anime',
                'cartoon',
                'restyle',
                'cel shading',
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
            id: 'USR-D03-photo-to-anime-flux-2',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Convert a Photo to Anime or Cartoon',
            description: 'Convert a Photo to Anime or Cartoon',
            template: `Convert this photograph into an anime / cartoon illustration in FLUX.2 edit (Kontext) mode with the photo as the input image. Render it with clean line art, cel shading, vibrant flat colors, and expressive stylized anime eyes and hair. Keep the same subject(s), the same pose and gesture, the same clothing design, and the same overall composition and framing so it reads as the same scene re-drawn as anime. Render clearly as an illustration, not a photorealistic image.

Settings: run in Kontext / edit mode so the pose and composition stay anchored to the source while the medium changes; guidance_scale ≈4; num_inference_steps 28–50. (FLUX uses no negative prompt — express exclusions positively, e.g. "flat anime illustration, clean line art, not photorealistic".)
`,
            parameters: [],
            examples: {},
            keywords: ['photo to anime', 'cartoon', 'restyle', 'cel shading', 'FLUX.2', 'Kontext', 'pose lock', 'D03'],
            executionContext: 'chat',
            model: 'flux-2',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-photo-to-anime-flux-2-klein',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Convert a Photo to Anime or Cartoon',
            description: 'Convert a Photo to Anime or Cartoon',
            template: `Convert this photo into an anime / cartoon illustration: clean line art, cel shading, vibrant flat colors, expressive stylized eyes and hair. Keep the same subject, pose, clothing, and composition recognizable. Render as an illustration, not a photo.

Settings: guidance_scale 1.0; num_inference_steps 4 (raise to 6–12 if the style looks incomplete); 1024×1024 matched to the source aspect ratio. Klein is best for a fast draft — refine line art and detail on a larger model if needed.
`,
            parameters: [],
            examples: {},
            keywords: ['photo to anime', 'cartoon', 'restyle', 'cel shading', 'FLUX.2 Klein', 'fast', '4-step', 'D03'],
            executionContext: 'chat',
            model: 'flux-2-klein',
            isMetaPrompt: true,
            recommendedSystemPromptId: 'SYS-D03-image-editing',
            relatedPromptIds: [],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'USR-D03-photo-to-anime-stable-diffusion',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Convert a Photo to Anime or Cartoon',
            description: 'Convert a Photo to Anime or Cartoon',
            template: `## Positive (SDXL — comma-tag)
anime illustration, cel shaded, clean line art, vibrant flat colors, expressive anime eyes, stylized hair, soft anime shading, detailed background, high quality anime art, same subject and pose, recognizable composition

## Positive (SD 3.5 — natural sentence)
An anime-style illustration of the same subject in the same pose and composition, with clean line art, cel shading, vibrant flat colors, and expressive stylized features.

## Negative
photorealistic, realistic, photo, 3d render, blurry, low quality, jpeg artifacts, noise, deformed, mutated, extra fingers, bad anatomy, watermark, text, oversaturated, changed pose, changed composition, different subject

## Settings
- Denoising strength 0.5–0.8 (higher for a stronger style change; lower to stay closer to the photo's layout).
- CFG 6–8 (SDXL) / 4–7 (SD 3.5); sampler DPM++ 2M Karras, 25–40 steps.
- Use an ANIME checkpoint (an SDXL anime model) — a base photoreal model won't give a clean anime look.
- ControlNet Canny / Lineart / Depth (weight 0.6–0.9) to hold structure, pose, and composition while the medium changes.
`,
            parameters: [],
            examples: {},
            keywords: [
                'photo to anime',
                'cartoon',
                'restyle',
                'cel shading',
                'Stable Diffusion',
                'SDXL',
                'SD 3.5',
                'anime checkpoint',
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
            id: 'USR-D03-photo-to-anime-joyai',
            kind: 'user',
            categoryCode: 'D03',
            title: 'Convert a Photo to Anime or Cartoon',
            description: 'Convert a Photo to Anime or Cartoon',
            template: `Convert this photograph into an anime / cartoon illustration. Re-render it with clean line art, cel shading, vibrant flat colors, and expressive stylized anime eyes and hair. Keep the same subject(s), the same pose and gesture, the same clothing design, and the same overall composition and framing so it reads as the same scene re-drawn. Render clearly as an illustration, not a photorealistic image.

Negative: \`--neg-prompt photorealistic, realistic, photo, 3d render, blurry, low quality, noise, deformed, extra fingers, bad anatomy, oversaturated, changed pose, changed composition, different subject, watermark, text\`
Settings: guidance_scale 4.0; num_inference_steps 30–50; basesize 1024; fixed \`--seed\`; add \`--rewrite-prompt\` for the built-in enhancer.
`,
            parameters: [],
            examples: {},
            keywords: [
                'photo to anime',
                'cartoon',
                'restyle',
                'cel shading',
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
