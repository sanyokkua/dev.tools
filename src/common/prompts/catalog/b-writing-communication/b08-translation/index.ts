import type { LogicalPromptDef } from '../../../model/types';

import { prompt as sysPrompt } from './sys.prompt.ts';
import { prompt as translateDictionaryPrompt } from './translate-dictionary.prompt.ts';
import { prompt as translateExamplesPrompt } from './translate-examples.prompt.ts';
import { prompt as translateTextPrompt } from './translate-text.prompt.ts';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    translateTextPrompt,
    translateDictionaryPrompt,
    translateExamplesPrompt,
];
