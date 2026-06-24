import type { LogicalPromptDef } from '../../../model/types';

import { prompt as breakdownPrompt } from './breakdown.prompt.ts';
import { prompt as dependenciesPrompt } from './dependencies.prompt.ts';
import { prompt as estimatePrompt } from './estimate.prompt.ts';
import { prompt as researchPlanPrompt } from './research-plan.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    breakdownPrompt,
    dependenciesPrompt,
    estimatePrompt,
    researchPlanPrompt,
];
