import type { LogicalPromptDef } from '../../../model/types';

import { prompt as generateIdeasPrompt } from './generate-ideas.prompt.js';
import { prompt as howMightWePrompt } from './how-might-we.prompt.js';
import { prompt as scamperPrompt } from './scamper.prompt.js';
import { prompt as scenariosPrompt } from './scenarios.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    generateIdeasPrompt,
    howMightWePrompt,
    scamperPrompt,
    scenariosPrompt,
];
