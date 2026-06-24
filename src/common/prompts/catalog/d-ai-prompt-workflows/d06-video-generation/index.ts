import type { LogicalPromptDef } from '../../../model/types';

import { prompt as generateVideoPrompt } from './generate-video.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [sysPrompt, generateVideoPrompt];
