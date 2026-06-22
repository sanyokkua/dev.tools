import type { LogicalPromptDef } from '../../../model/types';

import { prompt as adrPrompt } from './adr.prompt.js';
import { prompt as apiDesignPrompt } from './api-design.prompt.js';
import { prompt as designPrompt } from './design.prompt.js';
import { prompt as migrationPrompt } from './migration.prompt.js';
import { prompt as qualityScenariosPrompt } from './quality-scenarios.prompt.js';
import { prompt as reviewPrompt } from './review.prompt.js';
import { prompt as rfcPrompt } from './rfc.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';
import { prompt as tradeoffPrompt } from './tradeoff.prompt.js';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    designPrompt,
    apiDesignPrompt,
    qualityScenariosPrompt,
    tradeoffPrompt,
    adrPrompt,
    rfcPrompt,
    reviewPrompt,
    migrationPrompt,
];
