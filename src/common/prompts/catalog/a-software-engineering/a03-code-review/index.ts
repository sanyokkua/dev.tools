import type { LogicalPromptDef } from '../../../model/types';

import { prompt as checklistPrompt } from './checklist.prompt.ts';
import { prompt as politeCommentPrompt } from './polite-comment.prompt.ts';
import { prompt as reviewChangePrompt } from './review-change.prompt.ts';
import { prompt as selfReviewPrompt } from './self-review.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    reviewChangePrompt,
    checklistPrompt,
    selfReviewPrompt,
    politeCommentPrompt,
];
