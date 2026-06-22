import type { LogicalPromptDef } from '../../../model/types';

import { prompt as edgeCasesPrompt } from './edge-cases.prompt.js';
import { prompt as generateTestsPrompt } from './generate-tests.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';
import { prompt as testDataPrompt } from './test-data.prompt.js';
import { prompt as testStrategyPrompt } from './test-strategy.prompt.js';
import { prompt as updateTestsPrompt } from './update-tests.prompt.js';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    generateTestsPrompt,
    edgeCasesPrompt,
    updateTestsPrompt,
    testDataPrompt,
    testStrategyPrompt,
];
