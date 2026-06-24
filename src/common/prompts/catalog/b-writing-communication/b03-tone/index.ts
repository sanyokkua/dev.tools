import type { LogicalPromptDef } from '../../../model/types';

import { prompt as sysPrompt } from './sys.prompt.ts';
import { prompt as toneAdjustPrompt } from './tone-adjust.prompt.ts';
import { prompt as toneApologyPrompt } from './tone-apology.prompt.ts';
import { prompt as toneClarificationPrompt } from './tone-clarification.prompt.ts';
import { prompt as toneDeEscalatePrompt } from './tone-deEscalate.prompt.ts';
import { prompt as tonePoliteRequestPrompt } from './tone-politeRequest.prompt.ts';
import { prompt as toneSayNoPrompt } from './tone-sayNo.prompt.ts';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    toneAdjustPrompt,
    toneApologyPrompt,
    toneDeEscalatePrompt,
    tonePoliteRequestPrompt,
    toneClarificationPrompt,
    toneSayNoPrompt,
];
