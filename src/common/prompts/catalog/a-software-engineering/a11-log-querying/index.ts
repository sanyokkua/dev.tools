import type { LogicalPromptDef } from '../../../model/types';

import { prompt as logQueryPrompt } from './log-query.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [sysPrompt, logQueryPrompt];
