import type { LogicalPromptDef } from '../../../model/types';

import { prompt as classPrompt } from './class.prompt.js';
import { prompt as cqlQueryPrompt } from './cql-query.prompt.js';
import { prompt as fromSpecPrompt } from './from-spec.prompt.js';
import { prompt as functionPrompt } from './function.prompt.js';
import { prompt as regexPrompt } from './regex.prompt.js';
import { prompt as scaffoldPrompt } from './scaffold.prompt.js';
import { prompt as sqlQueryPrompt } from './sql-query.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    functionPrompt,
    classPrompt,
    fromSpecPrompt,
    scaffoldPrompt,
    regexPrompt,
    sqlQueryPrompt,
    cqlQueryPrompt,
];
