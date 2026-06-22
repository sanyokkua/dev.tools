import type { LogicalPromptDef } from '../../../model/types';

import { prompt as compressPrompt } from './compress.prompt.js';
import { prompt as critiquePrompt } from './critique.prompt.js';
import { prompt as expandPrompt } from './expand.prompt.js';
import { prompt as improveAgenticPrompt } from './improve-agentic.prompt.js';
import { prompt as improveTextPrompt } from './improve-text.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    improveTextPrompt,
    improveAgenticPrompt,
    compressPrompt,
    expandPrompt,
    critiquePrompt,
];
