import type { LogicalPromptDef } from '../../../model/types';

import { prompt as characterizePrompt } from './characterize.prompt.js';
import { prompt as improvePrompt } from './improve.prompt.js';
import { prompt as patternPrompt } from './pattern.prompt.js';
import { prompt as planPrompt } from './plan.prompt.js';
import { prompt as simplifyPrompt } from './simplify.prompt.js';
import { prompt as smellsPrompt } from './smells.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    smellsPrompt,
    planPrompt,
    improvePrompt,
    patternPrompt,
    simplifyPrompt,
    characterizePrompt,
];
