import type { LogicalPromptDef } from '../../../model/types';

import { prompt as compareSolutionsPrompt } from './compare-solutions.prompt.js';
import { prompt as prioritizePrompt } from './prioritize.prompt.js';
import { prompt as prosConsPrompt } from './pros-cons.prompt.js';
import { prompt as rootCausePrompt } from './root-cause.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';
import { prompt as weightedMatrixPrompt } from './weighted-matrix.prompt.js';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    prosConsPrompt,
    weightedMatrixPrompt,
    prioritizePrompt,
    compareSolutionsPrompt,
    rootCausePrompt,
];
