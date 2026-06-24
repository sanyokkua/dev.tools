import type { LogicalPromptDef } from '../../../model/types';

import { prompt as bugReportPrompt } from './bug-report.prompt.ts';
import { prompt as diagnosePrompt } from './diagnose.prompt.ts';
import { prompt as explainErrorPrompt } from './explain-error.prompt.ts';
import { prompt as hypothesesPrompt } from './hypotheses.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    diagnosePrompt,
    explainErrorPrompt,
    hypothesesPrompt,
    bugReportPrompt,
];
