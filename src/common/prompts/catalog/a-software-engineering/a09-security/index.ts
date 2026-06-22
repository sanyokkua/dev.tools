import type { LogicalPromptDef } from '../../../model/types';

import { prompt as depCheckPrompt } from './dep-check.prompt.js';
import { prompt as reviewPrompt } from './review.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';
import { prompt as threatModelPrompt } from './threat-model.prompt.js';

export const prompts: LogicalPromptDef[] = [sysPrompt, reviewPrompt, threatModelPrompt, depCheckPrompt];
