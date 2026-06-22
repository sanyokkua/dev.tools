import type { LogicalPromptDef } from '../../../model/types';

import { prompt as cartoonToPhotoPrompt } from './cartoon-to-photo.prompt.js';
import { prompt as colorizePrompt } from './colorize.prompt.js';
import { prompt as improvePortraitPrompt } from './improve-portrait.prompt.js';
import { prompt as improveScenePrompt } from './improve-scene.prompt.js';
import { prompt as photoToAnimePrompt } from './photo-to-anime.prompt.js';
import { prompt as restoreModernizePrompt } from './restore-modernize.prompt.js';
import { prompt as restorePortraitPrompt } from './restore-portrait.prompt.js';
import { prompt as restoreScenePrompt } from './restore-scene.prompt.js';
import { prompt as restylePortraitPrompt } from './restyle-portrait.prompt.js';
import { prompt as restyleSceneCinematicPrompt } from './restyle-scene-cinematic.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

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
