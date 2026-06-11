import type { AiTool, SelectedAiTool } from '@/common/ai-tools-data';
import {
    AI_TOOLS,
    AiToolCategory,
    buildInstallCommand,
    filterTools,
    getDefaultOption,
    getOptionsForPlatform,
} from '@/common/ai-tools-data';

const findTool = (id: string): AiTool => {
    const tool = AI_TOOLS.find((t) => t.id === id);
    if (!tool) throw new Error(`Tool not found: ${id}`);
    return tool;
};

describe('AI_TOOLS data integrity', () => {
    it('has exactly 15 tools', () => {
        expect(AI_TOOLS).toHaveLength(15);
    });

    it('every tool has a non-empty id, name, description, and category', () => {
        for (const tool of AI_TOOLS) {
            expect(tool.id).toBeTruthy();
            expect(tool.name).toBeTruthy();
            expect(tool.description).toBeTruthy();
            expect(tool.category).toBeTruthy();
        }
    });

    it('every tool has at least one InstallOption', () => {
        for (const tool of AI_TOOLS) {
            expect(tool.installOptions.length).toBeGreaterThan(0);
        }
    });

    it('every InstallOption has non-empty id, command, and label', () => {
        for (const tool of AI_TOOLS) {
            for (const opt of tool.installOptions) {
                expect(opt.id).toBeTruthy();
                expect(opt.command).toBeTruthy();
                expect(opt.label).toBeTruthy();
            }
        }
    });

    it('all tool ids are unique', () => {
        const ids = AI_TOOLS.map((t) => t.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });
});

describe('getOptionsForPlatform', () => {
    it('returns all-platform options (npm, conda) for Gemini CLI on any platform', () => {
        const gemini = findTool('gemini-cli');
        for (const platform of ['macos', 'linux', 'windows'] as const) {
            const options = getOptionsForPlatform(gemini, platform);
            expect(options.find((o) => o.id === 'npm')).toBeDefined();
            expect(options.find((o) => o.id === 'conda')).toBeDefined();
        }
    });
});

describe('getDefaultOption', () => {
    it('returns brew for Gemini CLI on macos (brew has higher priority than shell-script)', () => {
        const gemini = findTool('gemini-cli');
        const opt = getDefaultOption(gemini, 'macos');
        expect(opt?.id).toBe('brew');
    });

    it('returns shell-script for Claude Code on linux (shell-script > npm in linux priority)', () => {
        const claudeCode = findTool('claude-code');
        const opt = getDefaultOption(claudeCode, 'linux');
        expect(opt?.id).toBe('shell-script');
    });

    it('returns powershell for Claude Code on windows', () => {
        const claudeCode = findTool('claude-code');
        const opt = getDefaultOption(claudeCode, 'windows');
        expect(opt?.id).toBe('powershell');
    });

    it('returns uv for Mistral Vibe on windows', () => {
        const mistralVibe = findTool('mistral-vibe');
        const opt = getDefaultOption(mistralVibe, 'windows');
        expect(opt?.id).toBe('uv');
    });

    it('returns shell-script for OpenCode on linux (higher priority than paru)', () => {
        const openCode = findTool('opencode-cli');
        const opt = getDefaultOption(openCode, 'linux');
        expect(opt?.id).toBe('shell-script');
    });

    it('returns null for a tool with no options for the given platform', () => {
        const macOnlyTool: AiTool = {
            id: 'mock-macos-only',
            name: 'Mock macOS Only Tool',
            description: 'A mock tool with only macOS options',
            category: AiToolCategory.CLI_AGENTS,
            installOptions: [
                {
                    id: 'brew',
                    label: 'Homebrew',
                    command: 'brew install mock-tool',
                    platforms: ['macos'],
                    methodType: 'platform-specific',
                },
            ],
            links: {},
        };
        const opt = getDefaultOption(macOnlyTool, 'windows');
        expect(opt).toBeNull();
    });
});

describe('filterTools', () => {
    describe('windows platform-specific', () => {
        const result = filterTools(AI_TOOLS, 'windows', 'platform-specific');

        it('includes tools with native windows installers: Antigravity CLI, Claude Code, OpenAI Codex CLI, Qwen Code, Mistral Vibe', () => {
            const ids = result.map((t) => t.id);
            expect(ids).toContain('antigravity-cli');
            expect(ids).toContain('claude-code');
            expect(ids).toContain('openai-codex-cli');
            expect(ids).toContain('qwen-code');
            expect(ids).toContain('mistral-vibe');
        });

        it('does NOT include tools without native windows installers: Goose, Aider, Cursor, Gemini CLI', () => {
            const ids = result.map((t) => t.id);
            expect(ids).not.toContain('goose');
            expect(ids).not.toContain('aider');
            expect(ids).not.toContain('cursor');
            expect(ids).not.toContain('gemini-cli');
        });
    });

    describe('windows platform-independent', () => {
        const result = filterTools(AI_TOOLS, 'windows', 'platform-independent');

        it('includes tools with platform-independent (all) options: Gemini CLI, Aider, Claude Code, OpenAI Codex CLI, OpenCode, Qwen Code, Mistral Vibe', () => {
            const ids = result.map((t) => t.id);
            expect(ids).toContain('gemini-cli');
            expect(ids).toContain('aider');
            expect(ids).toContain('claude-code');
            expect(ids).toContain('openai-codex-cli');
            expect(ids).toContain('opencode-cli');
            expect(ids).toContain('qwen-code');
            expect(ids).toContain('mistral-vibe');
        });

        it('does NOT include tools with no all-platform options: Antigravity CLI, Antigravity IDE, Goose, Kiro CLI, Kiro IDE, OpenAI Codex App, OpenCode Desktop, Cursor', () => {
            const ids = result.map((t) => t.id);
            expect(ids).not.toContain('antigravity-cli');
            expect(ids).not.toContain('antigravity-ide');
            expect(ids).not.toContain('goose');
            expect(ids).not.toContain('kiro-cli');
            expect(ids).not.toContain('kiro-ide');
            expect(ids).not.toContain('openai-codex-app');
            expect(ids).not.toContain('opencode-desktop');
            expect(ids).not.toContain('cursor');
        });
    });

    it('returns all 15 tools for macos with both filter (all tools have at least one macos option)', () => {
        const result = filterTools(AI_TOOLS, 'macos', 'both');
        expect(result).toHaveLength(15);
    });
});

describe('buildInstallCommand', () => {
    it('returns the correct command for a SelectedAiTool', () => {
        const tool = findTool('claude-code');
        const selected: SelectedAiTool = { tool, selectedOptionId: 'npm' };
        const result = buildInstallCommand(selected);
        expect(result.description).toBe(tool.name);
        expect(result.command).toBe('npm install -g @anthropic-ai/claude-code');
    });

    it('returns empty string command when selectedOptionId does not match any option', () => {
        const tool = findTool('cursor');
        const selected: SelectedAiTool = { tool, selectedOptionId: 'nonexistent-option' };
        const result = buildInstallCommand(selected);
        expect(result.command).toBe('');
        expect(result.description).toBe(tool.name);
    });
});
