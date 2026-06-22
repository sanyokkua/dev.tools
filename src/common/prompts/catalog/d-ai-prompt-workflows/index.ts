import type { LogicalPromptDef } from '../../model/types';

import { prompts as cat0 } from './d01-prompt-engineering/index.js';
import { prompts as cat1 } from './d02-image-generation/index.js';
import { prompts as cat2 } from './d03-image-editing/index.js';
import { prompts as cat3 } from './d04-diagrams/index.js';
import { prompts as cat4 } from './d05-skill-authoring/index.js';
import { prompts as cat5 } from './d06-video-generation/index.js';

export const prompts: LogicalPromptDef[] = [...cat0, ...cat1, ...cat2, ...cat3, ...cat4, ...cat5];
