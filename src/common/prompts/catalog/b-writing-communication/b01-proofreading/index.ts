import type { LogicalPromptDef } from '../../../model/types';

import { prompt as editPolishPrompt } from './edit-polish.prompt.ts';
import { prompt as editpassFolderPrompt } from './editpass-folder.prompt.ts';
import { prompt as proofBasicPrompt } from './proof-basic.prompt.ts';
import { prompt as proofConsistencyPrompt } from './proof-consistency.prompt.ts';
import { prompt as proofEnhancedPrompt } from './proof-enhanced.prompt.ts';
import { prompt as proofReadabilityPrompt } from './proof-readability.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [
    editPolishPrompt,
    sysPrompt,
    proofBasicPrompt,
    proofEnhancedPrompt,
    proofConsistencyPrompt,
    proofReadabilityPrompt,
    editpassFolderPrompt,
];
