import type { LogicalPromptDef } from '../../../model/types';

import { prompt as editHumanizePrompt } from './edit-humanize.prompt.ts';
import { prompt as rewriteClarifyPrompt } from './rewrite-clarify.prompt.ts';
import { prompt as rewriteConcisePrompt } from './rewrite-concise.prompt.ts';
import { prompt as rewriteExpandPrompt } from './rewrite-expand.prompt.ts';
import { prompt as rewriteParaphrasePrompt } from './rewrite-paraphrase.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [
    editHumanizePrompt,
    sysPrompt,
    rewriteConcisePrompt,
    rewriteExpandPrompt,
    rewriteClarifyPrompt,
    rewriteParaphrasePrompt,
];
