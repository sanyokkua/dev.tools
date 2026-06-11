export type Platform = 'macos' | 'linux' | 'windows';
export type MethodType = 'platform-specific' | 'platform-independent';
export type MethodFilter = 'platform-specific' | 'platform-independent' | 'both';

export enum AiToolCategory {
    CLI_AGENTS = 'CLI Agents',
    IDE_DESKTOP = 'IDEs & Desktop Apps',
    LOCAL_LLM = 'Local LLM Runtime',
}

export interface InstallOption {
    id: string;
    label: string;
    command: string;
    platforms: Platform[] | 'all';
    methodType: MethodType;
}

export interface AiToolLinks {
    website?: string;
    github?: string;
    homebrew?: string;
    npm?: string;
    docs?: string;
}

export interface AiTool {
    id: string;
    name: string;
    description: string;
    category: AiToolCategory;
    installOptions: InstallOption[];
    links: AiToolLinks;
}

export interface SelectedAiTool {
    tool: AiTool;
    selectedOptionId: string;
}

export function getOptionsForPlatform(tool: AiTool, platform: Platform): InstallOption[] {
    return tool.installOptions.filter(
        (opt) => opt.platforms === 'all' || (opt.platforms as Platform[]).includes(platform),
    );
}

export function getDefaultOption(tool: AiTool, platform: Platform): InstallOption | null {
    const validOptions = getOptionsForPlatform(tool, platform);
    if (validOptions.length === 0) return null;

    const priorities: Record<Platform, string[]> = {
        macos: ['brew', 'shell-script', 'macports', 'npm', 'pip', 'conda', 'bun'],
        linux: ['shell-script', 'paru', 'brew', 'npm', 'pip', 'conda', 'bun'],
        windows: ['powershell', 'cmd-script', 'uv', 'npm', 'pip', 'conda', 'bun'],
    };

    for (const priority of priorities[platform]) {
        const found = validOptions.find((opt) => opt.id.startsWith(priority));
        if (found) return found;
    }

    return validOptions[0];
}

export function filterTools(tools: AiTool[], platform: Platform, methodFilter: MethodFilter): AiTool[] {
    return tools.filter((tool) => {
        const validOptions = getOptionsForPlatform(tool, platform);
        if (methodFilter === 'both') {
            return validOptions.length > 0;
        }
        if (methodFilter === 'platform-specific') {
            return validOptions.some((opt) => opt.methodType === 'platform-specific');
        }
        return validOptions.some((opt) => opt.platforms === 'all' && opt.methodType === 'platform-independent');
    });
}

export function buildInstallCommand(selected: SelectedAiTool): { description: string; command: string } {
    const option = selected.tool.installOptions.find((opt) => opt.id === selected.selectedOptionId);
    return { description: selected.tool.name, command: option ? option.command : '' };
}

export const AI_TOOLS: AiTool[] = [
    {
        id: 'gemini-cli',
        name: 'Gemini CLI',
        description: 'Terminal-based AI agent from Google with built-in Search and MCP support.',
        category: AiToolCategory.CLI_AGENTS,
        installOptions: [
            {
                id: 'brew',
                label: 'Homebrew',
                command: 'brew install gemini-cli',
                platforms: ['macos', 'linux'],
                methodType: 'platform-specific',
            },
            {
                id: 'macports',
                label: 'MacPorts',
                command: 'sudo port install gemini-cli',
                platforms: ['macos'],
                methodType: 'platform-specific',
            },
            {
                id: 'npm',
                label: 'npm',
                command: 'npm install -g @google/gemini-cli',
                platforms: 'all',
                methodType: 'platform-independent',
            },
            {
                id: 'conda',
                label: 'Conda',
                command: 'conda create -y -n gemini_env -c conda-forge nodejs && npm install -g @google/gemini-cli',
                platforms: 'all',
                methodType: 'platform-independent',
            },
        ],
        links: {
            website: 'https://geminicli.com/',
            github: 'https://github.com/google-gemini/gemini-cli',
            npm: 'https://www.npmjs.com/package/@google/gemini-cli',
        },
    },

    {
        id: 'antigravity-cli',
        name: 'Google Antigravity CLI',
        description: 'Agent-first ecosystem with IDE and CLI for autonomous end-to-end task execution.',
        category: AiToolCategory.CLI_AGENTS,
        installOptions: [
            {
                id: 'brew',
                label: 'Homebrew',
                command: 'brew install --cask antigravity-cli',
                platforms: ['macos'],
                methodType: 'platform-specific',
            },
            {
                id: 'shell-script',
                label: 'Shell Script',
                command: 'curl -fsSL https://antigravity.google/cli/install.sh | bash',
                platforms: ['macos', 'linux'],
                methodType: 'platform-specific',
            },
            {
                id: 'powershell',
                label: 'PowerShell',
                command: 'irm https://antigravity.google/cli/install.ps1 | iex',
                platforms: ['windows'],
                methodType: 'platform-specific',
            },
        ],
        links: {
            website: 'https://antigravity.google/download',
            homebrew: 'https://formulae.brew.sh/cask/antigravity-cli',
        },
    },

    {
        id: 'antigravity-ide',
        name: 'Google Antigravity IDE',
        description: 'Agent-first IDE for autonomous end-to-end task execution.',
        category: AiToolCategory.IDE_DESKTOP,
        installOptions: [
            {
                id: 'brew',
                label: 'Homebrew',
                command: 'brew install --cask antigravity-ide',
                platforms: ['macos'],
                methodType: 'platform-specific',
            },
        ],
        links: { website: 'https://antigravity.google/download' },
    },

    {
        id: 'aider',
        name: 'Aider',
        description: 'AI pair programming in the terminal — edits code directly in your Git repo.',
        category: AiToolCategory.CLI_AGENTS,
        installOptions: [
            {
                id: 'brew',
                label: 'Homebrew',
                command: 'brew install aider',
                platforms: ['macos', 'linux'],
                methodType: 'platform-specific',
            },
            {
                id: 'pip',
                label: 'pip',
                command: 'python -m pip install aider-install && aider-install',
                platforms: 'all',
                methodType: 'platform-independent',
            },
            {
                id: 'uv',
                label: 'uv',
                command: 'uv tool install aider-chat',
                platforms: 'all',
                methodType: 'platform-independent',
            },
        ],
        links: { website: 'https://aider.chat/', homebrew: 'https://formulae.brew.sh/formula/aider' },
    },

    {
        id: 'goose',
        name: 'Goose',
        description: 'Open-source AI agent for system-level orchestration by Block (formerly Square).',
        category: AiToolCategory.CLI_AGENTS,
        installOptions: [
            {
                id: 'brew',
                label: 'Homebrew',
                command: 'brew install block-goose-cli',
                platforms: ['macos', 'linux'],
                methodType: 'platform-specific',
            },
        ],
        links: { docs: 'https://goose-docs.ai/', homebrew: 'https://formulae.brew.sh/formula/block-goose-cli' },
    },

    {
        id: 'claude-code',
        name: 'Claude Code',
        description: "Anthropic's autonomous terminal AI that understands your codebase and handles Git workflows.",
        category: AiToolCategory.CLI_AGENTS,
        installOptions: [
            {
                id: 'brew',
                label: 'Homebrew',
                command: 'brew install --cask claude-code',
                platforms: ['macos'],
                methodType: 'platform-specific',
            },
            {
                id: 'shell-script',
                label: 'Shell Script',
                command: 'curl -fsSL https://claude.ai/install.sh | bash',
                platforms: ['macos', 'linux'],
                methodType: 'platform-specific',
            },
            {
                id: 'powershell',
                label: 'PowerShell',
                command: 'irm https://claude.ai/install.ps1 | iex',
                platforms: ['windows'],
                methodType: 'platform-specific',
            },
            {
                id: 'npm',
                label: 'npm',
                command: 'npm install -g @anthropic-ai/claude-code',
                platforms: 'all',
                methodType: 'platform-independent',
            },
        ],
        links: { website: 'https://claude.com/download', homebrew: 'https://formulae.brew.sh/cask/claude-code' },
    },

    {
        id: 'openai-codex-cli',
        name: 'OpenAI Codex CLI',
        description: 'Multi-agent workflow command center with parallel agents and Git worktree isolation.',
        category: AiToolCategory.CLI_AGENTS,
        installOptions: [
            {
                id: 'brew',
                label: 'Homebrew',
                command: 'brew install --cask codex',
                platforms: ['macos'],
                methodType: 'platform-specific',
            },
            {
                id: 'shell-script',
                label: 'Shell Script',
                command: 'curl -fsSL https://chatgpt.com/codex/install.sh | sh',
                platforms: ['macos', 'linux'],
                methodType: 'platform-specific',
            },
            {
                id: 'powershell',
                label: 'PowerShell',
                command: 'powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"',
                platforms: ['windows'],
                methodType: 'platform-specific',
            },
            {
                id: 'npm',
                label: 'npm',
                command: 'npm install -g @openai/codex',
                platforms: 'all',
                methodType: 'platform-independent',
            },
        ],
        links: { website: 'https://openai.com/codex/', homebrew: 'https://formulae.brew.sh/cask/codex' },
    },

    {
        id: 'openai-codex-app',
        name: 'OpenAI Codex App',
        description: 'OpenAI Codex desktop app for AI-powered coding workflows.',
        category: AiToolCategory.IDE_DESKTOP,
        installOptions: [
            {
                id: 'brew',
                label: 'Homebrew',
                command: 'brew install --cask codex-app',
                platforms: ['macos'],
                methodType: 'platform-specific',
            },
        ],
        links: { website: 'https://openai.com/codex/' },
    },

    {
        id: 'kiro-cli',
        name: 'Kiro CLI',
        description: 'Lightning-fast AI CLI for enterprise workflows with AWS integration.',
        category: AiToolCategory.CLI_AGENTS,
        installOptions: [
            {
                id: 'brew',
                label: 'Homebrew',
                command: 'brew install --cask kiro-cli',
                platforms: ['macos'],
                methodType: 'platform-specific',
            },
            {
                id: 'shell-script',
                label: 'Shell Script',
                command: 'curl -fsSL https://cli.kiro.dev/install | bash',
                platforms: ['macos', 'linux'],
                methodType: 'platform-specific',
            },
        ],
        links: {
            website: 'https://kiro.dev/',
            docs: 'https://kiro.dev/docs/cli/',
            homebrew: 'https://formulae.brew.sh/cask/kiro-cli',
        },
    },

    {
        id: 'kiro-ide',
        name: 'Kiro',
        description: 'Lightning-fast AI IDE for enterprise workflows with AWS integration.',
        category: AiToolCategory.IDE_DESKTOP,
        installOptions: [
            {
                id: 'brew',
                label: 'Homebrew',
                command: 'brew install --cask kiro',
                platforms: ['macos'],
                methodType: 'platform-specific',
            },
        ],
        links: { website: 'https://kiro.dev/' },
    },

    {
        id: 'opencode-cli',
        name: 'OpenCode',
        description: 'Open-source, provider-agnostic coding agent with local model and vector DB support.',
        category: AiToolCategory.CLI_AGENTS,
        installOptions: [
            {
                id: 'brew',
                label: 'Homebrew',
                command: 'brew install anomalyco/tap/opencode',
                platforms: ['macos'],
                methodType: 'platform-specific',
            },
            {
                id: 'shell-script',
                label: 'Shell Script',
                command: 'curl -fsSL https://opencode.ai/install | bash',
                platforms: ['macos', 'linux'],
                methodType: 'platform-specific',
            },
            {
                id: 'paru',
                label: 'Paru (Arch)',
                command: 'paru -S opencode',
                platforms: ['linux'],
                methodType: 'platform-specific',
            },
            {
                id: 'npm',
                label: 'npm',
                command: 'npm i -g opencode-ai',
                platforms: 'all',
                methodType: 'platform-independent',
            },
            {
                id: 'bun',
                label: 'Bun',
                command: 'bun add -g opencode-ai',
                platforms: 'all',
                methodType: 'platform-independent',
            },
        ],
        links: { website: 'https://opencode.ai/', homebrew: 'https://formulae.brew.sh/formula/opencode' },
    },

    {
        id: 'opencode-desktop',
        name: 'OpenCode Desktop',
        description: 'Open-source coding agent with a desktop GUI interface.',
        category: AiToolCategory.IDE_DESKTOP,
        installOptions: [
            {
                id: 'brew',
                label: 'Homebrew',
                command: 'brew install --cask opencode-desktop',
                platforms: ['macos'],
                methodType: 'platform-specific',
            },
        ],
        links: { website: 'https://opencode.ai/' },
    },

    {
        id: 'qwen-code',
        name: 'Qwen Code',
        description: 'Terminal AI coding tool by Alibaba, optimized for Qwen3-Coder with OpenAI-compatible protocol.',
        category: AiToolCategory.CLI_AGENTS,
        installOptions: [
            {
                id: 'brew',
                label: 'Homebrew',
                command: 'brew install qwen-code',
                platforms: ['macos', 'linux'],
                methodType: 'platform-specific',
            },
            {
                id: 'shell-script',
                label: 'Shell Script',
                command:
                    'curl -fsSL https://qwen-code-assets.oss-cn-hangzhou.aliyuncs.com/installation/install-qwen-standalone.sh | bash',
                platforms: ['macos', 'linux'],
                methodType: 'platform-specific',
            },
            {
                id: 'powershell',
                label: 'PowerShell',
                command:
                    'irm https://qwen-code-assets.oss-cn-hangzhou.aliyuncs.com/installation/install-qwen-standalone.ps1 | iex',
                platforms: ['windows'],
                methodType: 'platform-specific',
            },
            {
                id: 'npm',
                label: 'npm',
                command: 'npm install -g @qwen-code/qwen-code@latest',
                platforms: 'all',
                methodType: 'platform-independent',
            },
        ],
        links: {
            github: 'https://github.com/QwenLM/qwen-code',
            homebrew: 'https://formulae.brew.sh/formula/qwen-code',
        },
    },

    {
        id: 'mistral-vibe',
        name: 'Mistral Vibe',
        description: 'Terminal AI coding agent powered by Devstral models with MCP and Git context support.',
        category: AiToolCategory.CLI_AGENTS,
        installOptions: [
            {
                id: 'shell-script',
                label: 'Shell Script',
                command: 'curl -LsSf https://mistral.ai/vibe/install.sh | bash',
                platforms: ['macos', 'linux'],
                methodType: 'platform-specific',
            },
            {
                id: 'brew',
                label: 'Homebrew',
                command: 'brew install mistral-vibe',
                platforms: ['macos', 'linux'],
                methodType: 'platform-specific',
            },
            {
                id: 'uv',
                label: 'uv',
                command: 'uv tool install mistral-vibe',
                platforms: 'all',
                methodType: 'platform-independent',
            },
            {
                id: 'pip',
                label: 'pip',
                command: 'pip install mistral-vibe',
                platforms: 'all',
                methodType: 'platform-independent',
            },
            {
                id: 'uv-installer',
                label: 'uv (install uv first)',
                command: 'irm https://astral.sh/uv/install.ps1 | iex && uv tool install mistral-vibe',
                platforms: ['windows'],
                methodType: 'platform-specific',
            },
        ],
        links: {
            github: 'https://github.com/mistralai/mistral-vibe',
            homebrew: 'https://formulae.brew.sh/formula/mistral-vibe',
        },
    },

    {
        id: 'cursor',
        name: 'Cursor',
        description: 'AI-first VS Code fork with tab-autocomplete, inline generation, and agentic multi-file ops.',
        category: AiToolCategory.IDE_DESKTOP,
        installOptions: [
            {
                id: 'brew',
                label: 'Homebrew',
                command: 'brew install --cask cursor',
                platforms: ['macos'],
                methodType: 'platform-specific',
            },
        ],
        links: { website: 'https://cursor.com/', homebrew: 'https://formulae.brew.sh/cask/cursor' },
    },
];
