import type { LogicalPromptDef } from '../../model/types';

import { prompts as cat0 } from './a01-code-generation/index.ts';
import { prompts as cat1 } from './a02-code-refactoring/index.ts';
import { prompts as cat2 } from './a03-code-review/index.ts';
import { prompts as cat3 } from './a04-debugging/index.ts';
import { prompts as cat4 } from './a05-testing/index.ts';
import { prompts as cat5 } from './a06-code-documentation/index.ts';
import { prompts as cat6 } from './a07-architecture/index.ts';
import { prompts as cat7 } from './a08-change-communication/index.ts';
import { prompts as cat8 } from './a09-security/index.ts';
import { prompts as cat9 } from './a10-operations-delivery/index.ts';
import { prompts as cat10 } from './a11-log-querying/index.ts';

export const prompts: LogicalPromptDef[] = [
    ...cat0,
    ...cat1,
    ...cat2,
    ...cat3,
    ...cat4,
    ...cat5,
    ...cat6,
    ...cat7,
    ...cat8,
    ...cat9,
    ...cat10,
];
