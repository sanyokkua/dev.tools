import type { LogicalPromptDef } from '../../model/types';

import { prompts as cat0 } from './c01-ideation/index.js';
import { prompts as cat1 } from './c02-decision-support/index.js';
import { prompts as cat2 } from './c03-planning/index.js';
import { prompts as cat3 } from './c04-research-synthesis/index.js';

export const prompts: LogicalPromptDef[] = [...cat0, ...cat1, ...cat2, ...cat3];
