import type { LogicalPromptDef } from '../../../model/types';

import { prompt as buildFullSkillPrompt } from './build-full-skill.prompt.ts';
import { prompt as buildLiteSkillPrompt } from './build-lite-skill.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [sysPrompt, buildLiteSkillPrompt, buildFullSkillPrompt];
