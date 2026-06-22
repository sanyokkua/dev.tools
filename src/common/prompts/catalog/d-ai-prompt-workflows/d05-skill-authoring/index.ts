import type { LogicalPromptDef } from '../../../model/types';

import { prompt as buildFullSkillPrompt } from './build-full-skill.prompt.js';
import { prompt as buildLiteSkillPrompt } from './build-lite-skill.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [sysPrompt, buildLiteSkillPrompt, buildFullSkillPrompt];
