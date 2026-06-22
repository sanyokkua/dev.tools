import type { LogicalPromptDef } from '../../../model/types';

import { prompt as formatBlogPrompt } from './format-blog.prompt.js';
import { prompt as formatBulletsPrompt } from './format-bullets.prompt.js';
import { prompt as formatEmailPrompt } from './format-email.prompt.js';
import { prompt as formatHeadlinesPrompt } from './format-headlines.prompt.js';
import { prompt as formatParagraphsPrompt } from './format-paragraphs.prompt.js';
import { prompt as formatProsePrompt } from './format-prose.prompt.js';
import { prompt as formatReportPrompt } from './format-report.prompt.js';
import { prompt as formatResumePrompt } from './format-resume.prompt.js';
import { prompt as formatSocialPrompt } from './format-social.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';

export const prompts: LogicalPromptDef[] = [
    sysPrompt,
    formatParagraphsPrompt,
    formatBulletsPrompt,
    formatProsePrompt,
    formatEmailPrompt,
    formatReportPrompt,
    formatSocialPrompt,
    formatBlogPrompt,
    formatResumePrompt,
    formatHeadlinesPrompt,
];
