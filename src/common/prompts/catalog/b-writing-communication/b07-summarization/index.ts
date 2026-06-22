import type { LogicalPromptDef } from '../../../model/types';

import { prompt as sumExecutivePrompt } from './sum-executive.prompt.js';
import { prompt as sumHashtagsPrompt } from './sum-hashtags.prompt.js';
import { prompt as sumKeyPointsPrompt } from './sum-keyPoints.prompt.js';
import { prompt as sumSimplePrompt } from './sum-simple.prompt.js';
import { prompt as sumSummaryPrompt } from './sum-summary.prompt.js';
import { prompt as sumTldrPrompt } from './sum-tldr.prompt.js';
import { prompt as synthesizeFolderPrompt } from './synthesize-folder.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    sumSummaryPrompt,
    sumTldrPrompt,
    sumKeyPointsPrompt,
    sumExecutivePrompt,
    sumSimplePrompt,
    sumHashtagsPrompt,
    synthesizeFolderPrompt,
];
