import type { LogicalPromptDef } from '../../../model/types';

import { prompt as cartoonToPhotoPrompt } from './cartoon-to-photo.prompt.ts';
import { prompt as colorizePrompt } from './colorize.prompt.ts';
import { prompt as improvePortraitPrompt } from './improve-portrait.prompt.ts';
import { prompt as improveScenePrompt } from './improve-scene.prompt.ts';
import { prompt as photoToAnimePrompt } from './photo-to-anime.prompt.ts';
import { prompt as restoreModernizePrompt } from './restore-modernize.prompt.ts';
import { prompt as restorePortraitPrompt } from './restore-portrait.prompt.ts';
import { prompt as restoreScenePrompt } from './restore-scene.prompt.ts';
import { prompt as restylePortraitPrompt } from './restyle-portrait.prompt.ts';
import { prompt as restyleSceneCinematicPrompt } from './restyle-scene-cinematic.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    restorePortraitPrompt,
    restoreScenePrompt,
    improvePortraitPrompt,
    improveScenePrompt,
    restylePortraitPrompt,
    restyleSceneCinematicPrompt,
    photoToAnimePrompt,
    cartoonToPhotoPrompt,
    colorizePrompt,
    restoreModernizePrompt,
];
