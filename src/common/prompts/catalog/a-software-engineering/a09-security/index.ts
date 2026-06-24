import type { LogicalPromptDef } from '../../../model/types';

import { prompt as depCheckPrompt } from './dep-check.prompt.ts';
import { prompt as reviewPrompt } from './review.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';
import { prompt as threatModelPrompt } from './threat-model.prompt.ts';

export const prompts: LogicalPromptDef[] = [sysPrompt, reviewPrompt, threatModelPrompt, depCheckPrompt];
