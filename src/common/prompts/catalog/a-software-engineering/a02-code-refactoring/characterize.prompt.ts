import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A02-characterize',
    categoryCode: 'A02',
    title: 'Write Characterization Tests for Legacy Code',
    subtitle: 'Pin the CURRENT behavior of untested legacy code before refactoring',
    description: 'Pin the CURRENT behavior of untested legacy code before refactoring',
    variantAxes: [],
    defaultVariantId: 'USR-A02-refactor-characterize',
    modeClass: 'chat-only',
    variants: [
        {
            id: 'USR-A02-refactor-characterize',
            kind: 'user',
            categoryCode: 'A02',
            title: 'Write Characterization Tests for Legacy Code',
            description: 'Write Characterization Tests for Legacy Code',
            template: `You are a legacy-code specialist. Generate characterization tests that pin the CURRENT behavior of the {{language}} code below, so it can be refactored safely.

Code:
\`\`\`
{{code}}
\`\`\`

Rules:
1. Characterization tests document what the code ACTUALLY does today — not what it "should" do. Do not assert intended/ideal behavior; capture observed behavior, including quirks and bugs.
2. Cover the main paths and the boundary/edge inputs that exercise the code's branches. Where the expected value is unclear from reading the code, mark the assertion with a \`TODO: confirm by running\` note.
3. Use {{language}}'s native test framework. Mock only true external boundaries (network, database, clock, filesystem).
4. Identify seams (dependency-injection points) needed to get the code under test, if it is tightly coupled.

Output contract:
1. The characterization tests in a fenced block.
2. Notes on any seams required and any behaviors that must be confirmed by execution (TODOs).
`,
            parameters: [
                {
                    name: 'language',
                    label: 'Programming language / test framework',
                    description: 'Programming language (and test framework if known)',
                    control: 'select',
                    optional: false,
                    valueSetId: 'programming-language',
                },
                {
                    name: 'code',
                    label: 'Legacy code',
                    description: 'The legacy code to characterize',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: { code: ['<an untested function with branching and a side effect>'] },
            keywords: ['characterization tests', 'legacy code', 'pin behavior', 'seams', 'safe refactor', 'A02'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A02-code-refactoring',
            relatedPromptIds: ['LP-A02-plan', 'LP-A05-generate-tests'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
