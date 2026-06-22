import type { LogicalPromptDef } from '../../../model/types';

import { prompt as cicdPrompt } from './cicd.prompt.ts';
import { prompt as observabilityPrompt } from './observability.prompt.ts';
import { prompt as postmortemPrompt } from './postmortem.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [sysPrompt, cicdPrompt, observabilityPrompt, postmortemPrompt];
