import type { LogicalPromptDef } from '../../../model/types';

import { prompt as generateImagePrompt } from './generate-image.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [sysPrompt, generateImagePrompt];
