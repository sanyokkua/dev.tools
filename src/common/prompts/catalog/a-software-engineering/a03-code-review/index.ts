import type { LogicalPromptDef } from '../../../model/types';

import { prompt as checklistPrompt } from './checklist.prompt.js';
import { prompt as politeCommentPrompt } from './polite-comment.prompt.js';
import { prompt as reviewChangePrompt } from './review-change.prompt.js';
import { prompt as selfReviewPrompt } from './self-review.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    reviewChangePrompt,
    checklistPrompt,
    selfReviewPrompt,
    politeCommentPrompt,
];
