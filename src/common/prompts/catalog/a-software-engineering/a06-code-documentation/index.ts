import type { LogicalPromptDef } from '../../../model/types';

import { prompt as apiReferencePrompt } from './api-reference.prompt.js';
import { prompt as diataxisPrompt } from './diataxis.prompt.js';
import { prompt as docstringsPrompt } from './docstrings.prompt.js';
import { prompt as explainCodePrompt } from './explain-code.prompt.js';
import { prompt as readmePrompt } from './readme.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    docstringsPrompt,
    readmePrompt,
    apiReferencePrompt,
    explainCodePrompt,
    diataxisPrompt,
];
