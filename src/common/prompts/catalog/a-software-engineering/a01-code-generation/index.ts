import type { LogicalPromptDef } from '../../../model/types';

import { prompt as classPrompt } from './class.prompt.ts';
import { prompt as cqlQueryPrompt } from './cql-query.prompt.ts';
import { prompt as fromSpecPrompt } from './from-spec.prompt.ts';
import { prompt as functionPrompt } from './function.prompt.ts';
import { prompt as regexPrompt } from './regex.prompt.ts';
import { prompt as scaffoldPrompt } from './scaffold.prompt.ts';
import { prompt as sqlQueryPrompt } from './sql-query.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

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
