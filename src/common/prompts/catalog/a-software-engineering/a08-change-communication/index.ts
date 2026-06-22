import type { LogicalPromptDef } from '../../../model/types';

import { prompt as changelogPrompt } from './changelog.prompt.js';
import { prompt as commitPrompt } from './commit.prompt.js';
import { prompt as prPrompt } from './pr.prompt.js';
import { prompt as releaseNotesPrompt } from './release-notes.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [sysPrompt, commitPrompt, prPrompt, changelogPrompt, releaseNotesPrompt];
