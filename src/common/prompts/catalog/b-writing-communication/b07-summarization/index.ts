import type { LogicalPromptDef } from '../../../model/types';

import { prompt as sumExecutivePrompt } from './sum-executive.prompt.ts';
import { prompt as sumHashtagsPrompt } from './sum-hashtags.prompt.ts';
import { prompt as sumKeyPointsPrompt } from './sum-keyPoints.prompt.ts';
import { prompt as sumSimplePrompt } from './sum-simple.prompt.ts';
import { prompt as sumSummaryPrompt } from './sum-summary.prompt.ts';
import { prompt as sumTldrPrompt } from './sum-tldr.prompt.ts';
import { prompt as synthesizeFolderPrompt } from './synthesize-folder.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

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
