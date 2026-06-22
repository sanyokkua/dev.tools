import type { LogicalPromptDef } from '../../../model/types';

import { prompt as generateIdeasPrompt } from './generate-ideas.prompt.ts';
import { prompt as howMightWePrompt } from './how-might-we.prompt.ts';
import { prompt as scamperPrompt } from './scamper.prompt.ts';
import { prompt as scenariosPrompt } from './scenarios.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    generateIdeasPrompt,
    howMightWePrompt,
    scamperPrompt,
    scenariosPrompt,
];
