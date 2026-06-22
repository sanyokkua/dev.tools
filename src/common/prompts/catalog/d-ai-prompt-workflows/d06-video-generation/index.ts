import type { LogicalPromptDef } from '../../../model/types';

import { prompt as generateVideoPrompt } from './generate-video.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [sysPrompt, generateVideoPrompt];
