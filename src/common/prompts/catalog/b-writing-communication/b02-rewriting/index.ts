import type { LogicalPromptDef } from '../../../model/types';

import { prompt as editHumanizePrompt } from './edit-humanize.prompt.js';
import { prompt as rewriteClarifyPrompt } from './rewrite-clarify.prompt.js';
import { prompt as rewriteConcisePrompt } from './rewrite-concise.prompt.js';
import { prompt as rewriteExpandPrompt } from './rewrite-expand.prompt.js';
import { prompt as rewriteParaphrasePrompt } from './rewrite-paraphrase.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [
    editHumanizePrompt,
    sysPrompt,
    rewriteConcisePrompt,
    rewriteExpandPrompt,
    rewriteClarifyPrompt,
    rewriteParaphrasePrompt,
];
