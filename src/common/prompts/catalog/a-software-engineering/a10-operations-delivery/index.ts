import type { LogicalPromptDef } from '../../../model/types';

import { prompt as cicdPrompt } from './cicd.prompt.js';
import { prompt as observabilityPrompt } from './observability.prompt.js';
import { prompt as postmortemPrompt } from './postmortem.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [sysPrompt, cicdPrompt, observabilityPrompt, postmortemPrompt];
