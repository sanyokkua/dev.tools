import type { LogicalPromptDef } from '../../../model/types';

import { prompt as characterizePrompt } from './characterize.prompt.ts';
import { prompt as improvePrompt } from './improve.prompt.ts';
import { prompt as patternPrompt } from './pattern.prompt.ts';
import { prompt as planPrompt } from './plan.prompt.ts';
import { prompt as simplifyPrompt } from './simplify.prompt.ts';
import { prompt as smellsPrompt } from './smells.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    smellsPrompt,
    planPrompt,
    improvePrompt,
    patternPrompt,
    simplifyPrompt,
    characterizePrompt,
];
