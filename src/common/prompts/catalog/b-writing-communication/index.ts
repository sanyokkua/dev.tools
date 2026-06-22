import type { LogicalPromptDef } from '../../model/types';

import { prompts as cat0 } from './b01-proofreading/index.js';
import { prompts as cat1 } from './b02-rewriting/index.js';
import { prompts as cat2 } from './b03-tone/index.js';
import { prompts as cat3 } from './b04-style/index.js';
import { prompts as cat4 } from './b05-formatting/index.js';
import { prompts as cat5 } from './b06-document-structuring/index.js';
import { prompts as cat6 } from './b07-summarization/index.js';
import { prompts as cat7 } from './b08-translation/index.js';
import { prompts as cat8 } from './b09-workplace-communication/index.js';

export const prompts: LogicalPromptDef[] = [
    ...cat0,
    ...cat1,
    ...cat2,
    ...cat3,
    ...cat4,
    ...cat5,
    ...cat6,
    ...cat7,
    ...cat8,
];
