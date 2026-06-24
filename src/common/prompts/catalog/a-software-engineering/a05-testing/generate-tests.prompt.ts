import type { LogicalPromptDef } from '../../../model/types';

export const prompt: LogicalPromptDef = {
    id: 'LP-A05-generate-tests',
    categoryCode: 'A05',
    title: 'Generate Unit Tests',
    subtitle: 'Tests prioritizing edge cases — chat + repository-aware agent twin',
    description: 'Tests prioritizing edge cases — chat + repository-aware agent twin',
    variantAxes: ['mode'],
    defaultVariantId: 'USR-A05-test-generate',
    modeClass: 'dual',
    variants: [
        {
            id: 'USR-A05-test-generate',
            kind: 'user',
            categoryCode: 'A05',
            title: 'Generate Unit Tests',
            description: 'Generate Unit Tests',
            template: `You are a test engineer. Generate unit tests for the code below using {{framework}}.

Code under test:
\`\`\`
{{code}}
\`\`\`

Rules:
1. Cover at least one happy path plus several negative/edge/boundary cases. Test behavior through the public interface, not internal state.
2. Mock only true external boundaries (network, database, clock, filesystem); do NOT mock the logic under test.
3. Use parameterized/table-driven tests for combinatorial inputs. Give each test a clear scenario name.
4. Do not assert behavior the code does not exhibit; if intended behavior is ambiguous, add a test marked \`TODO\` with the question.

Output contract:
1. The tests in a fenced block, runnable with {{framework}}.
2. A short list of the scenarios covered and any gaps you could not cover.
`,
            parameters: [
                {
                    name: 'framework',
                    label: 'Language + test framework',
                    description:
                        'Language + test framework (e.g., "Python pytest", "JavaScript Vitest", "Go testing", "JUnit 5")',
                    control: 'text',
                    optional: false,
                },
                {
                    name: 'code',
                    label: 'Code under test',
                    description: 'The code to test',
                    control: 'textarea',
                    optional: false,
                },
            ],
            examples: { code: ['<a discount calculator function>', '<a parser with error cases>'] },
            keywords: ['unit tests', 'generate', 'edge cases', 'mocking', 'framework', 'A05'],
            executionContext: 'chat',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A05-testing',
            relatedPromptIds: ['LP-A05-edge-cases', 'LP-A05-test-data'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
        {
            id: 'AGT-A05-generate-tests',
            kind: 'agent',
            categoryCode: 'A05',
            title: 'Agent: Generate Unit Tests',
            description: 'Generate Unit Tests',
            template: `You are a test engineer working as an autonomous agent INSIDE the repository at \`{{repo_path}}\`. Generate and run tests for the target.

Target: {{target_paths}}
Optional focus: {{user_intent}}

Workflow:
1. INSPECT: traverse the repo. Detect the test framework, directory layout, naming conventions, and existing test style by reading existing tests. Match them exactly. Cite the real files you relied on.
2. ANALYZE the target's behavior and enumerate edge/boundary/error cases before writing tests.
3. WRITE tests covering at least one happy path plus several negative/edge cases. Mock only true external boundaries (network/database/clock/filesystem); do NOT mock the logic under test. Place files where the repo expects them.
4. RUN the tests using the project's test command; iterate until they pass or until a genuine product bug is found. If a test reveals a real defect, REPORT it — do not weaken the assertion to make it pass.
5. VERIFY honestly — report actual results (pass/fail counts).

Constraints: follow repo conventions; mock boundaries only; do not modify production code except to fix an obvious test-blocking issue (and flag it); do not fabricate test results.

Output (verification summary): test files added (real paths) · scenarios covered · framework/commands used · run results (pass/fail counts) · any product bug discovered · coverage gaps. End with \`TESTS_COMPLETE\`.
`,
            parameters: [
                {
                    name: 'repo_path',
                    label: 'Repository path',
                    description: 'Path to the repository',
                    control: 'text',
                    optional: false,
                },
                {
                    name: 'target_paths',
                    label: 'Target file(s)/module(s)',
                    description: 'The file(s)/module(s) to test',
                    control: 'text',
                    optional: false,
                },
                {
                    name: 'user_intent',
                    label: 'Focus',
                    description: 'Optional focus (e.g., "edge cases only", "add integration tests")',
                    control: 'text',
                    optional: true,
                },
            ],
            examples: {
                target_paths: ['src/pricing/discount.ts', 'internal/auth/token.go'],
                user_intent: ['focus on boundary conditions'],
            },
            keywords: ['agent', 'repository', 'tests', 'run tests', 'framework', 'edge cases', 'A05'],
            executionContext: 'agent',
            model: null,
            isMetaPrompt: false,
            recommendedSystemPromptId: 'SYS-A05-testing',
            relatedPromptIds: ['LP-A05-edge-cases', 'LP-A05-test-data'],
            relatedSkillIds: [],
            supports: { style: false, tone: false, context: false },
        },
    ],
};
