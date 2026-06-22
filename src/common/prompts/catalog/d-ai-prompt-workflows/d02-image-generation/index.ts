import type { LogicalPromptDef } from '../../../model/types';

import { prompt as generateImagePrompt } from './generate-image.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [sysPrompt, generateImagePrompt];
