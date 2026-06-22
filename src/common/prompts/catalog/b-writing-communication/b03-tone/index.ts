import type { LogicalPromptDef } from '../../../model/types';

import { prompt as sysPrompt } from './sys.prompt.js';
import { prompt as toneAdjustPrompt } from './tone-adjust.prompt.js';
import { prompt as toneApologyPrompt } from './tone-apology.prompt.js';
import { prompt as toneClarificationPrompt } from './tone-clarification.prompt.js';
import { prompt as toneDeEscalatePrompt } from './tone-deEscalate.prompt.js';
import { prompt as tonePoliteRequestPrompt } from './tone-politeRequest.prompt.js';
import { prompt as toneSayNoPrompt } from './tone-sayNo.prompt.js';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    toneAdjustPrompt,
    toneApologyPrompt,
    toneDeEscalatePrompt,
    tonePoliteRequestPrompt,
    toneClarificationPrompt,
    toneSayNoPrompt,
];
