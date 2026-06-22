import type { LogicalPromptDef } from '../../../model/types';

import { prompt as edgeCasesPrompt } from './edge-cases.prompt.ts';
import { prompt as generateTestsPrompt } from './generate-tests.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';
import { prompt as testDataPrompt } from './test-data.prompt.ts';
import { prompt as testStrategyPrompt } from './test-strategy.prompt.ts';
import { prompt as updateTestsPrompt } from './update-tests.prompt.ts';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    generateTestsPrompt,
    edgeCasesPrompt,
    updateTestsPrompt,
    testDataPrompt,
    testStrategyPrompt,
];
