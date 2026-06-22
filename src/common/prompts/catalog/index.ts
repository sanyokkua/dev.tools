import type { Category, Domain, LogicalPromptDef } from '../model/types';
import { ABBREVIATIONS } from '../registries/abbreviations.js';
import { CONTEXTS } from '../registries/contexts.js';
import { MODELS } from '../registries/models.js';
import { STYLES } from '../registries/styles.js';
import { TONES } from '../registries/tones.js';
import { VALUE_SETS } from '../registries/value-sets.js';
import { prompts as aPrompts } from './a-software-engineering/index.js';
import { prompts as cPrompts } from './c-thinking-productivity/index.js';

export { ABBREVIATIONS, CONTEXTS, MODELS, STYLES, TONES, VALUE_SETS };

export const domains: Domain[] = [
    {
        code: 'A',
        title: 'Software Engineering',
        description:
            'Code generation, refactoring, review, debugging, testing, documentation, architecture, and delivery.',
        slug: 'software-engineering',
    },
    {
        code: 'C',
        title: 'Thinking & Productivity',
        description: 'Ideation, decision support, planning, and research synthesis.',
        slug: 'thinking-productivity',
    },
];

export const categories: Category[] = [
    {
        code: 'A01',
        domainCode: 'A',
        slug: 'code-generation',
        title: 'Code Generation',
        recommendedSystemPromptId: 'SYS-A01-code-generation',
    },
    {
        code: 'A02',
        domainCode: 'A',
        slug: 'code-refactoring',
        title: 'Code Refactoring',
        recommendedSystemPromptId: 'SYS-A02-code-refactoring',
    },
    {
        code: 'A03',
        domainCode: 'A',
        slug: 'code-review',
        title: 'Code Review',
        recommendedSystemPromptId: 'SYS-A03-code-review',
    },
    {
        code: 'A04',
        domainCode: 'A',
        slug: 'debugging',
        title: 'Debugging',
        recommendedSystemPromptId: 'SYS-A04-debugging',
    },
    { code: 'A05', domainCode: 'A', slug: 'testing', title: 'Testing', recommendedSystemPromptId: 'SYS-A05-testing' },
    {
        code: 'A06',
        domainCode: 'A',
        slug: 'code-documentation',
        title: 'Code Documentation',
        recommendedSystemPromptId: 'SYS-A06-code-documentation',
    },
    {
        code: 'A07',
        domainCode: 'A',
        slug: 'architecture',
        title: 'Architecture',
        recommendedSystemPromptId: 'SYS-A07-architecture',
    },
    {
        code: 'A08',
        domainCode: 'A',
        slug: 'change-communication',
        title: 'Change Communication',
        recommendedSystemPromptId: 'SYS-A08-change-communication',
    },
    {
        code: 'A09',
        domainCode: 'A',
        slug: 'security',
        title: 'Security',
        recommendedSystemPromptId: 'SYS-A09-security',
    },
    {
        code: 'A10',
        domainCode: 'A',
        slug: 'operations-delivery',
        title: 'Operations & Delivery',
        recommendedSystemPromptId: 'SYS-A10-operations-delivery',
    },
    {
        code: 'A11',
        domainCode: 'A',
        slug: 'log-querying',
        title: 'Log Querying',
        recommendedSystemPromptId: 'SYS-A11-log-querying',
    },
    {
        code: 'C01',
        domainCode: 'C',
        slug: 'ideation',
        title: 'Ideation',
        recommendedSystemPromptId: 'SYS-C01-ideation',
    },
    {
        code: 'C02',
        domainCode: 'C',
        slug: 'decision-support',
        title: 'Decision Support',
        recommendedSystemPromptId: 'SYS-C02-decision-support',
    },
    {
        code: 'C03',
        domainCode: 'C',
        slug: 'planning',
        title: 'Planning',
        recommendedSystemPromptId: 'SYS-C03-planning',
    },
    {
        code: 'C04',
        domainCode: 'C',
        slug: 'research-synthesis',
        title: 'Research Synthesis',
        recommendedSystemPromptId: 'SYS-C04-research-synthesis',
    },
];

export const prompts: LogicalPromptDef[] = [...aPrompts, ...cPrompts];

export const skills = [];
