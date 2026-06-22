import type { LogicalPromptDef } from '../../../model/types';

import { prompt as logQueryPrompt } from './log-query.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [sysPrompt, logQueryPrompt];
