import type { LogicalPromptDef } from '../../../model/types';

import { prompt as compressPrompt } from './compress.prompt.ts';
import { prompt as critiquePrompt } from './critique.prompt.ts';
import { prompt as expandPrompt } from './expand.prompt.ts';
import { prompt as improveAgenticPrompt } from './improve-agentic.prompt.ts';
import { prompt as improveTextPrompt } from './improve-text.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    improveTextPrompt,
    improveAgenticPrompt,
    compressPrompt,
    expandPrompt,
    critiquePrompt,
];
