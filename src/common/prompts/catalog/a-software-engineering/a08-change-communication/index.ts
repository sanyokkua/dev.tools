import type { LogicalPromptDef } from '../../../model/types';

import { prompt as changelogPrompt } from './changelog.prompt.ts';
import { prompt as commitPrompt } from './commit.prompt.ts';
import { prompt as prPrompt } from './pr.prompt.ts';
import { prompt as releaseNotesPrompt } from './release-notes.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [sysPrompt, commitPrompt, prPrompt, changelogPrompt, releaseNotesPrompt];
