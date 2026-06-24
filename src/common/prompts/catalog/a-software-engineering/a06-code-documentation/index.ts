import type { LogicalPromptDef } from '../../../model/types';

import { prompt as apiReferencePrompt } from './api-reference.prompt.ts';
import { prompt as diataxisPrompt } from './diataxis.prompt.ts';
import { prompt as docstringsPrompt } from './docstrings.prompt.ts';
import { prompt as explainCodePrompt } from './explain-code.prompt.ts';
import { prompt as readmePrompt } from './readme.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    docstringsPrompt,
    readmePrompt,
    apiReferencePrompt,
    explainCodePrompt,
    diataxisPrompt,
];
