import type { LogicalPromptDef } from '../../../model/types';

import { prompt as compareSolutionsPrompt } from './compare-solutions.prompt.ts';
import { prompt as prioritizePrompt } from './prioritize.prompt.ts';
import { prompt as prosConsPrompt } from './pros-cons.prompt.ts';
import { prompt as rootCausePrompt } from './root-cause.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';
import { prompt as weightedMatrixPrompt } from './weighted-matrix.prompt.ts';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    prosConsPrompt,
    weightedMatrixPrompt,
    prioritizePrompt,
    compareSolutionsPrompt,
    rootCausePrompt,
];
