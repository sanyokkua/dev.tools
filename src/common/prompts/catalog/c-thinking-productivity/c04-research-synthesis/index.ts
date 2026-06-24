import type { LogicalPromptDef } from '../../../model/types';

import { prompt as matrixPrompt } from './matrix.prompt.ts';
import { prompt as researchQuestionsPrompt } from './research-questions.prompt.ts';
import { prompt as sourceEvalPrompt } from './source-eval.prompt.ts';
import { prompt as synthesizePrompt } from './synthesize.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    researchQuestionsPrompt,
    sourceEvalPrompt,
    matrixPrompt,
    synthesizePrompt,
];
