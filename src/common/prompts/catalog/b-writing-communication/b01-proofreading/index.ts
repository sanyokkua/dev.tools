import type { LogicalPromptDef } from '../../../model/types';

import { prompt as editPolishPrompt } from './edit-polish.prompt.js';
import { prompt as editpassFolderPrompt } from './editpass-folder.prompt.js';
import { prompt as proofBasicPrompt } from './proof-basic.prompt.js';
import { prompt as proofConsistencyPrompt } from './proof-consistency.prompt.js';
import { prompt as proofEnhancedPrompt } from './proof-enhanced.prompt.js';
import { prompt as proofReadabilityPrompt } from './proof-readability.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [
    editPolishPrompt,
    sysPrompt,
    proofBasicPrompt,
    proofEnhancedPrompt,
    proofConsistencyPrompt,
    proofReadabilityPrompt,
    editpassFolderPrompt,
];
