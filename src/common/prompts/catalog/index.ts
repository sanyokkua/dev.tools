import type { Category, Domain, LogicalPromptDef } from '../model/types';
import { ABBREVIATIONS } from '../registries/abbreviations.js';
import { CONTEXTS } from '../registries/contexts.js';
import { MODELS } from '../registries/models.js';
import { STYLES } from '../registries/styles.js';
import { TONES } from '../registries/tones.js';
import { VALUE_SETS } from '../registries/value-sets.js';
import { skills as allSkills } from '../skills/index.js';
import { prompts as aPrompts } from './a-software-engineering/index.js';
import { prompts as bPrompts } from './b-writing-communication/index.js';
import { prompts as cPrompts } from './c-thinking-productivity/index.js';
import { prompts as dPrompts } from './d-ai-prompt-workflows/index.js';

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
        code: 'B',
        title: 'Writing & Communication',
        description:
            'Proofreading, rewriting, tone, style, formatting, document structuring, summarization, translation, and workplace communication.',
        slug: 'writing-communication',
    },
    {
        code: 'C',
        title: 'Thinking & Productivity',
        description: 'Ideation, decision support, planning, and research synthesis.',
        slug: 'thinking-productivity',
    },
    {
        code: 'D',
        title: 'AI & Prompt Workflows',
        description:
            'Prompt engineering, image generation, image editing, diagrams, skill authoring, and video generation.',
        slug: 'ai-prompt-workflows',
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
        code: 'B01',
        domainCode: 'B',
        slug: 'proofreading',
        title: 'Proofreading',
        recommendedSystemPromptId: 'SYS-B01-proofreading',
    },
    {
        code: 'B02',
        domainCode: 'B',
        slug: 'rewriting',
        title: 'Rewriting',
        recommendedSystemPromptId: 'SYS-B02-rewriting',
    },
    { code: 'B03', domainCode: 'B', slug: 'tone', title: 'Tone', recommendedSystemPromptId: 'SYS-B03-tone' },
    { code: 'B04', domainCode: 'B', slug: 'style', title: 'Style', recommendedSystemPromptId: 'SYS-B04-style' },
    {
        code: 'B05',
        domainCode: 'B',
        slug: 'formatting',
        title: 'Formatting',
        recommendedSystemPromptId: 'SYS-B05-formatting',
    },
    {
        code: 'B06',
        domainCode: 'B',
        slug: 'document-structuring',
        title: 'Document Structuring',
        recommendedSystemPromptId: 'SYS-B06-document-structuring',
    },
    {
        code: 'B07',
        domainCode: 'B',
        slug: 'summarization',
        title: 'Summarization',
        recommendedSystemPromptId: 'SYS-B07-summarization',
    },
    {
        code: 'B08',
        domainCode: 'B',
        slug: 'translation',
        title: 'Translation',
        recommendedSystemPromptId: 'SYS-B08-translation',
    },
    {
        code: 'B09',
        domainCode: 'B',
        slug: 'workplace-communication',
        title: 'Workplace Communication',
        recommendedSystemPromptId: 'SYS-B09-workplace-communication',
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
    {
        code: 'D01',
        domainCode: 'D',
        slug: 'prompt-engineering',
        title: 'Prompt Engineering',
        recommendedSystemPromptId: 'SYS-D01-prompt-engineering',
    },
    {
        code: 'D02',
        domainCode: 'D',
        slug: 'image-generation',
        title: 'Image Generation',
        recommendedSystemPromptId: 'SYS-D02-image-generation',
    },
    {
        code: 'D03',
        domainCode: 'D',
        slug: 'image-editing',
        title: 'Image Editing',
        recommendedSystemPromptId: 'SYS-D03-image-editing',
    },
    {
        code: 'D04',
        domainCode: 'D',
        slug: 'diagrams',
        title: 'Diagrams & Visualization',
        recommendedSystemPromptId: 'SYS-D04-diagrams-visualization',
    },
    {
        code: 'D05',
        domainCode: 'D',
        slug: 'skill-authoring',
        title: 'Skill Authoring',
        recommendedSystemPromptId: 'SYS-D05-skill-authoring',
    },
    {
        code: 'D06',
        domainCode: 'D',
        slug: 'video-generation',
        title: 'Video Generation',
        recommendedSystemPromptId: 'SYS-D06-video-generation',
    },
];

export const prompts: LogicalPromptDef[] = [...aPrompts, ...bPrompts, ...cPrompts, ...dPrompts];

export const skills = allSkills;
