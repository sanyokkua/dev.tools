import type { LogicalPromptDef } from '../../../model/types';

import { prompt as matrixPrompt } from './matrix.prompt.js';
import { prompt as researchQuestionsPrompt } from './research-questions.prompt.js';
import { prompt as sourceEvalPrompt } from './source-eval.prompt.js';
import { prompt as synthesizePrompt } from './synthesize.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    researchQuestionsPrompt,
    sourceEvalPrompt,
    matrixPrompt,
    synthesizePrompt,
];
