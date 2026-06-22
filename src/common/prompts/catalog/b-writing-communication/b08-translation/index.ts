import type { LogicalPromptDef } from '../../../model/types';

import { prompt as sysPrompt } from './sys.prompt.js';
import { prompt as translateDictionaryPrompt } from './translate-dictionary.prompt.js';
import { prompt as translateExamplesPrompt } from './translate-examples.prompt.js';
import { prompt as translateTextPrompt } from './translate-text.prompt.js';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    translateTextPrompt,
    translateDictionaryPrompt,
    translateExamplesPrompt,
];
