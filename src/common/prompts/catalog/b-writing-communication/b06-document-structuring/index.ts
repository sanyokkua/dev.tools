import type { LogicalPromptDef } from '../../../model/types';

import { prompt as docstructFaqPrompt } from './docstruct-faq.prompt.ts';
import { prompt as docstructInstructionsPrompt } from './docstruct-instructions.prompt.ts';
import { prompt as docstructMarkdownPrompt } from './docstruct-markdown.prompt.ts';
import { prompt as docstructMeetingMinutesPrompt } from './docstruct-meetingMinutes.prompt.ts';
import { prompt as docstructOrganizePrompt } from './docstruct-organize.prompt.ts';
import { prompt as docstructProposalPrompt } from './docstruct-proposal.prompt.ts';
import { prompt as docstructSpecPrompt } from './docstruct-spec.prompt.ts';
import { prompt as docstructUserStoryPrompt } from './docstruct-userStory.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

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
