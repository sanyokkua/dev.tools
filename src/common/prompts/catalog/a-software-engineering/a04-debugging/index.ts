import type { LogicalPromptDef } from '../../../model/types';

import { prompt as bugReportPrompt } from './bug-report.prompt.js';
import { prompt as diagnosePrompt } from './diagnose.prompt.js';
import { prompt as explainErrorPrompt } from './explain-error.prompt.js';
import { prompt as hypothesesPrompt } from './hypotheses.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    diagnosePrompt,
    explainErrorPrompt,
    hypothesesPrompt,
    bugReportPrompt,
];
