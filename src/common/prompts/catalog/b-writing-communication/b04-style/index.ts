import type { LogicalPromptDef } from '../../../model/types';

import { prompt as editProfessionalizePrompt } from './edit-professionalize.prompt.ts';
import { prompt as styleAdaptPrompt } from './style-adapt.prompt.ts';
import { prompt as styleMarketingPrompt } from './style-marketing.prompt.ts';
import { prompt as styleRiskReducePrompt } from './style-riskReduce.prompt.ts';
import { prompt as styleSeoPrompt } from './style-seo.prompt.ts';
import { prompt as styleSimplifyPrompt } from './style-simplify.prompt.ts';
import { prompt as styleToneRewritePrompt } from './style-tone-rewrite.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

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
