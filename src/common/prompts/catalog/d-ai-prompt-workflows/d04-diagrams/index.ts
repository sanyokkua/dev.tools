import type { LogicalPromptDef } from '../../../model/types';

import { prompt as drawioBuildPrompt } from './drawio-build.prompt.js';
import { prompt as drawioExplainPrompt } from './drawio-explain.prompt.js';
import { prompt as mermaidPrompt } from './mermaid.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [sysPrompt, mermaidPrompt, drawioBuildPrompt, drawioExplainPrompt];
