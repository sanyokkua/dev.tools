import type { LogicalPromptDef } from '../../../model/types';

import { prompt as drawioBuildPrompt } from './drawio-build.prompt.ts';
import { prompt as drawioExplainPrompt } from './drawio-explain.prompt.ts';
import { prompt as mermaidPrompt } from './mermaid.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

export const prompts: LogicalPromptDef[] = [sysPrompt, mermaidPrompt, drawioBuildPrompt, drawioExplainPrompt];
