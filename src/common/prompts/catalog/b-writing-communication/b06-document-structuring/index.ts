import type { LogicalPromptDef } from '../../../model/types';

import { prompt as docstructFaqPrompt } from './docstruct-faq.prompt.js';
import { prompt as docstructInstructionsPrompt } from './docstruct-instructions.prompt.js';
import { prompt as docstructMarkdownPrompt } from './docstruct-markdown.prompt.js';
import { prompt as docstructMeetingMinutesPrompt } from './docstruct-meetingMinutes.prompt.js';
import { prompt as docstructOrganizePrompt } from './docstruct-organize.prompt.js';
import { prompt as docstructProposalPrompt } from './docstruct-proposal.prompt.js';
import { prompt as docstructSpecPrompt } from './docstruct-spec.prompt.js';
import { prompt as docstructUserStoryPrompt } from './docstruct-userStory.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    docstructMarkdownPrompt,
    docstructOrganizePrompt,
    docstructInstructionsPrompt,
    docstructFaqPrompt,
    docstructMeetingMinutesPrompt,
    docstructProposalPrompt,
    docstructSpecPrompt,
    docstructUserStoryPrompt,
];
