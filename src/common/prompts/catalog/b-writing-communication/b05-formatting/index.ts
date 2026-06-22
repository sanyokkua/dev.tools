import type { LogicalPromptDef } from '../../../model/types';

import { prompt as formatBlogPrompt } from './format-blog.prompt.ts';
import { prompt as formatBulletsPrompt } from './format-bullets.prompt.ts';
import { prompt as formatEmailPrompt } from './format-email.prompt.ts';
import { prompt as formatHeadlinesPrompt } from './format-headlines.prompt.ts';
import { prompt as formatParagraphsPrompt } from './format-paragraphs.prompt.ts';
import { prompt as formatProsePrompt } from './format-prose.prompt.ts';
import { prompt as formatReportPrompt } from './format-report.prompt.ts';
import { prompt as formatResumePrompt } from './format-resume.prompt.ts';
import { prompt as formatSocialPrompt } from './format-social.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';

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
