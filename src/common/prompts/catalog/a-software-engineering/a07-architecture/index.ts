import type { LogicalPromptDef } from '../../../model/types';

import { prompt as adrPrompt } from './adr.prompt.ts';
import { prompt as apiDesignPrompt } from './api-design.prompt.ts';
import { prompt as designPrompt } from './design.prompt.ts';
import { prompt as migrationPrompt } from './migration.prompt.ts';
import { prompt as qualityScenariosPrompt } from './quality-scenarios.prompt.ts';
import { prompt as reviewPrompt } from './review.prompt.ts';
import { prompt as rfcPrompt } from './rfc.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';
import { prompt as tradeoffPrompt } from './tradeoff.prompt.ts';

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
