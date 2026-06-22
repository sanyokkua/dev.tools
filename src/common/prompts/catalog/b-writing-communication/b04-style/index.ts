import type { LogicalPromptDef } from '../../../model/types';

import { prompt as editProfessionalizePrompt } from './edit-professionalize.prompt.js';
import { prompt as styleAdaptPrompt } from './style-adapt.prompt.js';
import { prompt as styleMarketingPrompt } from './style-marketing.prompt.js';
import { prompt as styleRiskReducePrompt } from './style-riskReduce.prompt.js';
import { prompt as styleSeoPrompt } from './style-seo.prompt.js';
import { prompt as styleSimplifyPrompt } from './style-simplify.prompt.js';
import { prompt as styleToneRewritePrompt } from './style-tone-rewrite.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [
    styleToneRewritePrompt,
    editProfessionalizePrompt,
    sysPrompt,
    styleAdaptPrompt,
    styleSimplifyPrompt,
    styleMarketingPrompt,
    styleSeoPrompt,
    styleRiskReducePrompt,
];
