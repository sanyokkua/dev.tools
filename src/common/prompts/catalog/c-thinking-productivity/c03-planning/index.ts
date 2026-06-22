import type { LogicalPromptDef } from '../../../model/types';

import { prompt as breakdownPrompt } from './breakdown.prompt.js';
import { prompt as dependenciesPrompt } from './dependencies.prompt.js';
import { prompt as estimatePrompt } from './estimate.prompt.js';
import { prompt as researchPlanPrompt } from './research-plan.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    breakdownPrompt,
    dependenciesPrompt,
    estimatePrompt,
    researchPlanPrompt,
];
