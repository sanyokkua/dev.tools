import { Application, BrewType, Category, Command } from '@/common/types';

/**
 * List of applications available for installation via Homebrew on macOS.
 * Each application is represented as an object containing its unique identifier, name,
 * description, type of installation (CASK or BOTTLE), and category classification.
 * This list serves as a reference for managing and installing software packages on macOS systems.
 */
export const MAC_OS_BREW_APPS: Application[] = [
    {
        id: 'android-file-transfer',
        name: 'Android File Transfer',
        description: 'File transfer tool for Android devices',
        brewType: BrewType.CASK,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'openmtp',
        name: 'OpenMTP',
        description: 'Android file transfer',
        brewType: BrewType.CASK,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'appcleaner',
        name: 'AppCleaner',
        description: 'Application uninstaller tool',
        brewType: BrewType.CASK,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'corretto',
        name: 'Amazon Corretto',
        description: 'OpenJDK (Latest) distribution from Amazon',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'corretto@11',
        name: 'Amazon Corretto 11',
        description: 'OpenJDK 11 distribution from Amazon',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'corretto@17',
        name: 'Amazon Corretto 17',
        description: 'OpenJDK 17 distribution from Amazon',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'corretto@21',
        name: 'Amazon Corretto 21',
        description: 'OpenJDK 21 distribution from Amazon',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'corretto@25',
        name: 'Amazon Corretto 25',
        description: 'OpenJDK 25 distribution from Amazon',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'corretto@8',
        name: 'Amazon Corretto 8',
        description: 'OpenJDK 8 distribution from Amazon',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'dbeaver-community',
        name: 'DBeaver Community',
        description: 'Open-source database management tool',
        brewType: BrewType.CASK,
        category: Category.DATABASE_CLIENTS,
    },
    {
        id: 'docker-desktop',
        name: 'Docker Desktop',
        description: 'Container management platform',
        brewType: BrewType.CASK,
        category: Category.VIRTUALIZATION,
    },
    {
        id: 'drawio',
        name: 'Draw.io',
        description: 'Diagramming and flowchart tool',
        brewType: BrewType.CASK,
        category: Category.DIAGRAM_TOOLS,
    },
    {
        id: 'firefox',
        name: 'Firefox',
        description: 'Web browser by Mozilla',
        brewType: BrewType.CASK,
        category: Category.BROWSERS,
    },
    {
        id: 'google-chrome',
        name: 'Google Chrome',
        description: 'Web browser by Google',
        brewType: BrewType.CASK,
        category: Category.BROWSERS,
    },
    {
        id: 'iina',
        name: 'IINA',
        description: 'Modern video player for macOS',
        brewType: BrewType.CASK,
        category: Category.MEDIA_PLAYERS,
    },
    {
        id: 'intellij-idea',
        name: 'IntelliJ IDEA',
        description: 'Java IDE with advanced features',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'keka',
        name: 'Keka',
        description: 'File archiving utility',
        brewType: BrewType.CASK,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'lm-studio',
        name: 'LM Studio',
        description: 'Local LLM platform',
        brewType: BrewType.CASK,
        category: Category.LLM_PLATFORMS,
    },
    {
        id: 'microsoft-edge',
        name: 'Microsoft Edge',
        description: 'Web browser by Microsoft',
        brewType: BrewType.CASK,
        category: Category.BROWSERS,
    },
    {
        id: 'microsoft-teams',
        name: 'Microsoft Teams',
        description: 'Collaboration and communication platform',
        brewType: BrewType.CASK,
        category: Category.COMMUNICATION,
    },
    {
        id: 'ollama-app',
        name: 'Ollama',
        description: 'Local LLM application',
        brewType: BrewType.CASK,
        category: Category.LLM_PLATFORMS,
    },
    {
        id: 'opera',
        name: 'Opera',
        description: 'Web browser with built-in ad blocker',
        brewType: BrewType.CASK,
        category: Category.BROWSERS,
    },
    {
        id: 'postman',
        name: 'Postman',
        description: 'API development and testing tool',
        brewType: BrewType.CASK,
        category: Category.API_TOOLS,
    },
    {
        id: 'bruno',
        name: 'Bruno',
        description: 'Open source IDE for exploring and testing APIs',
        brewType: BrewType.CASK,
        category: Category.API_TOOLS,
    },
    {
        id: 'signal',
        name: 'Signal',
        description: 'Secure messaging application',
        brewType: BrewType.CASK,
        category: Category.COMMUNICATION,
    },
    {
        id: 'spotify',
        name: 'Spotify',
        description: 'Music streaming service',
        brewType: BrewType.CASK,
        category: Category.MEDIA_PLAYERS,
    },
    {
        id: 'tad',
        name: 'Tad',
        description: 'Tabular data viewer',
        brewType: BrewType.CASK,
        category: Category.DIAGRAM_TOOLS,
    },
    {
        id: 'telegram',
        name: 'Telegram',
        description: 'Cloud-based messaging app',
        brewType: BrewType.CASK,
        category: Category.COMMUNICATION,
    },
    {
        id: 'tor-browser',
        name: 'Tor Browser',
        description: 'Privacy-focused web browser',
        brewType: BrewType.CASK,
        category: Category.BROWSERS,
    },
    {
        id: 'transmission',
        name: 'Transmission',
        description: 'BitTorrent client',
        brewType: BrewType.CASK,
        category: Category.DOWNLOAD_MANAGERS,
    },
    {
        id: 'visual-studio-code',
        name: 'Visual Studio Code',
        description: 'Open-source code editor',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'sublime-text',
        name: 'Sublime Text',
        description: 'Sophisticated text editor',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'vscodium',
        name: 'VSCodium',
        description: 'Open-source binary distribution of VS Code',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'cursor',
        name: 'Cursor',
        description: 'AI-powered code editor',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'pycharm',
        name: 'PyCharm',
        description: 'Python IDE (Professional Edition)',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'phpstorm',
        name: 'PhpStorm',
        description: 'PHP IDE',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'goland',
        name: 'GoLand',
        description: 'Go (Lang) IDE',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    { id: 'rider', name: 'Rider', description: '.NET IDE', brewType: BrewType.CASK, category: Category.CODE_EDITORS },
    { id: 'clion', name: 'CLion', description: 'C/C++ IDE', brewType: BrewType.CASK, category: Category.CODE_EDITORS },
    {
        id: 'rustrover',
        name: 'RustRover',
        description: 'Rust IDE',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'rubymine',
        name: 'RubyMine',
        description: 'Ruby IDE',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'datagrip',
        name: 'DataGrip',
        description: 'Database IDE',
        brewType: BrewType.CASK,
        category: Category.DATABASE_CLIENTS,
    },
    {
        id: 'vlc',
        name: 'VLC Media Player',
        description: 'Open-source multimedia player',
        brewType: BrewType.CASK,
        category: Category.MEDIA_PLAYERS,
    },
    {
        id: 'codeedit',
        name: 'CodeEdit',
        description: 'Open-source code editor',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'eclipse-ide',
        name: 'Eclipse IDE',
        description: 'Open-source IDE for Java and other languages',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'springtoolsforeclipse',
        name: 'Spring Tools for Eclipse',
        description: 'Eclipse plugin for Spring Boot development',
        brewType: BrewType.CASK,
        category: Category.IDE_EXTENSIONS,
    },
    {
        id: 'netbeans',
        name: 'NetBeans',
        description: 'Java IDE',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'google-drive',
        name: 'Google Drive',
        description: 'Client for the Google Drive storage service',
        brewType: BrewType.CASK,
        category: Category.CLOUD_STORAGE,
    },
    {
        id: 'dropbox',
        name: 'Dropbox',
        description: 'Client for the Dropbox cloud storage service',
        brewType: BrewType.CASK,
        category: Category.CLOUD_STORAGE,
    },
    {
        id: 'thunderbird',
        name: 'Thunderbird',
        description: 'Email client',
        brewType: BrewType.CASK,
        category: Category.COMMUNICATION,
    },
    {
        id: 'libreoffice',
        name: 'LibreOffice',
        description: 'Office suite',
        brewType: BrewType.CASK,
        category: Category.DOCUMENT_EDITORS,
    },
    {
        id: 'openoffice',
        name: 'OpenOffice',
        description: 'Office suite',
        brewType: BrewType.CASK,
        category: Category.DOCUMENT_EDITORS,
    },
    {
        id: 'softmaker-freeoffice',
        name: 'SoftMaker FreeOffice',
        description: 'Office suite',
        brewType: BrewType.CASK,
        category: Category.DOCUMENT_EDITORS,
    },
    {
        id: 'brave-browser',
        name: 'Brave Browser',
        description: 'Web browser with built-in ad blocker',
        brewType: BrewType.CASK,
        category: Category.BROWSERS,
    },
    {
        id: 'blender',
        name: 'Blender',
        description: '3D creation suite',
        brewType: BrewType.CASK,
        category: Category.GRAPHICS_AND_3D,
    },
    {
        id: 'android-studio',
        name: 'Android Studio',
        description: 'Android IDE',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'docker',
        name: 'Docker',
        description: 'Containerization platform',
        brewType: BrewType.COMMAND,
        category: Category.VIRTUALIZATION,
    },
    {
        id: 'docker-compose',
        name: 'Docker Compose',
        description: 'Multi-container Docker orchestration',
        brewType: BrewType.COMMAND,
        category: Category.VIRTUALIZATION,
    },
    {
        id: 'neovim',
        name: 'Neovim',
        description: 'Text editor',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'nano',
        name: 'Nano',
        description: 'Free (GNU) replacement for the Pico text editor',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'podman',
        name: 'Podman',
        description: 'Container runtime',
        brewType: BrewType.COMMAND,
        category: Category.VIRTUALIZATION,
    },
    {
        id: 'podman-compose',
        name: 'Podman Compose',
        description: 'Multi-container Podman orchestration',
        brewType: BrewType.COMMAND,
        category: Category.VIRTUALIZATION,
    },
    {
        id: 'node@22',
        name: 'Node.js 22',
        description: 'Node.js runtime version 22',
        brewType: BrewType.COMMAND,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'node@24',
        name: 'Node.js 24',
        description: 'Node.js runtime version 24',
        brewType: BrewType.COMMAND,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'go',
        name: 'Go',
        description: 'Go programming language',
        brewType: BrewType.COMMAND,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'git',
        name: 'Git',
        description: 'Distributed version control system',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'vim',
        name: 'Vim',
        description: 'Text editor',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'wget',
        name: 'Wget',
        description: 'Network data retrieval tool',
        brewType: BrewType.COMMAND,
        category: Category.DOWNLOAD_MANAGERS,
    },
    {
        id: 'exiftool',
        name: 'ExifTool',
        description: 'Read/write metadata in files',
        brewType: BrewType.COMMAND,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'jenv',
        name: 'JEnv',
        description: 'Manage Java environments',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'node',
        name: 'Node.js',
        description: 'Node.js runtime',
        brewType: BrewType.COMMAND,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'python@3.13',
        name: 'Python 3.13',
        description: 'Python programming language version 3.13',
        brewType: BrewType.COMMAND,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'python@3.14',
        name: 'Python 3.14',
        description: 'Python programming language version 3.14',
        brewType: BrewType.COMMAND,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'maven',
        name: 'Maven',
        description: 'Project management and comprehension tool',
        brewType: BrewType.COMMAND,
        category: Category.BUILD_TOOLING,
    },
    {
        id: 'pinentry-mac',
        name: 'Pinentry',
        description: 'Password entry utility for GPG on Mac',
        brewType: BrewType.COMMAND,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'zed',
        name: 'Zed',
        description: 'Multiplayer code editor',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'antigravity',
        name: 'Google Antigravity',
        description: 'AI Coding Agent IDE',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'kate',
        name: 'Kate',
        description: 'Multi-document editor by KDE',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'upscayl',
        name: 'Upscayl',
        description: 'AI image upscaler',
        brewType: BrewType.CASK,
        category: Category.GRAPHICS_AND_3D,
    },
    {
        id: 'utm',
        name: 'UTM',
        description: 'Virtual machines UI using QEMU',
        brewType: BrewType.CASK,
        category: Category.VIRTUALIZATION,
    },
    {
        id: 'llama.cpp',
        name: 'Llama.cpp',
        description: 'LLM inference in C/C++',
        brewType: BrewType.COMMAND,
        category: Category.LLM_PLATFORMS,
    },
    {
        id: 'nvm',
        name: 'nvm',
        description: 'Manage multiple Node.js versions',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'pyenv',
        name: 'PyEnv',
        description: 'Python version management',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'tree',
        name: 'tree',
        description: 'Display directories as trees (with optional color/HTML output)',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'protonvpn',
        name: 'ProtonVPN',
        description: 'VPN client focusing on security',
        brewType: BrewType.CASK,
        category: Category.NETWORKING,
    },
    {
        id: 'ffmpeg',
        name: 'FFmpeg',
        description: 'Play, record, convert, and stream select audio and video codecs',
        brewType: BrewType.COMMAND,
        category: Category.MEDIA_PLAYERS,
    },
    {
        id: 'htop',
        name: 'htop',
        description: 'Improved top (interactive process viewer)',
        brewType: BrewType.COMMAND,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'curl',
        name: 'cURL',
        description: 'Get a file from an HTTP, HTTPS or FTP server',
        brewType: BrewType.COMMAND,
        category: Category.DOWNLOAD_MANAGERS,
    },
    {
        id: 'uv',
        name: 'uv',
        description: 'Extremely fast Python package installer and resolver, written in Rust',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'nvtop',
        name: 'nvtop',
        description: 'Interactive GPU process monitor',
        brewType: BrewType.COMMAND,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'iterm2',
        name: 'iTerm2',
        description: "Terminal emulator as alternative to Apple's Terminal app",
        brewType: BrewType.CASK,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'gemini-cli',
        name: 'Gemini CLI',
        description: 'Interact with Google Gemini AI models from the command-line',
        brewType: BrewType.COMMAND,
        category: Category.AI_CODING_TOOLS,
    },
    {
        id: 'qwen-code',
        name: 'Qwen Code',
        description: 'AI-powered command-line workflow tool for developers',
        brewType: BrewType.COMMAND,
        category: Category.AI_CODING_TOOLS,
    },
    {
        id: 'mistral-vibe',
        name: 'Mistral Vibe',
        description: 'Terminal AI coding agent powered by Devstral models with MCP and Git context support.',
        brewType: BrewType.COMMAND,
        category: Category.AI_CODING_TOOLS,
    },
    {
        id: 'claude-code',
        name: 'Claude Code',
        description: 'Terminal-based AI coding assistant',
        brewType: BrewType.CASK,
        category: Category.AI_CODING_TOOLS,
    },
    {
        id: 'claude',
        name: 'Claude',
        description: "Anthropic's official Claude AI desktop app",
        brewType: BrewType.CASK,
        category: Category.AI_CODING_TOOLS,
    },
    {
        id: 'opencode',
        name: 'OpenCode',
        description: 'AI coding agent, built for the terminal',
        brewType: BrewType.COMMAND,
        category: Category.AI_CODING_TOOLS,
    },
    {
        id: 'opencode-desktop',
        name: 'OpenCode Desktop',
        description: 'OpenCode AI coding agent desktop client',
        brewType: BrewType.CASK,
        category: Category.AI_CODING_TOOLS,
    },
    {
        id: 'kiro-cli',
        name: 'Kiro CLI',
        description: 'AI-powered productivity tool for the command-line',
        brewType: BrewType.CASK,
        category: Category.AI_CODING_TOOLS,
    },
    {
        id: 'jellyfin',
        name: 'Jellyfin',
        description: 'Media system',
        brewType: BrewType.CASK,
        category: Category.MEDIA_PLAYERS,
    },
    {
        id: 'pearcleaner',
        name: 'Pearcleaner',
        description: 'Utility to uninstall apps and remove leftover files from old/uninstalled apps',
        brewType: BrewType.CASK,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'visual-studio-code@insiders',
        name: 'VS Code Insiders',
        description: 'Open-source code editor',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'joplin',
        name: 'Joplin',
        description: 'Note taking and to-do application with synchronisation capabilities',
        brewType: BrewType.CASK,
        category: Category.NOTE_TAKING,
    },
    {
        id: 'aider',
        name: 'Aider',
        description: 'AI pair programming in your terminal',
        brewType: BrewType.COMMAND,
        category: Category.AI_CODING_TOOLS,
    },
    {
        id: 'codex',
        name: 'Codex',
        description: "OpenAI's coding agent that runs in your terminal",
        brewType: BrewType.CASK,
        category: Category.AI_CODING_TOOLS,
    },
    {
        id: 'codex-app',
        name: 'Codex App',
        description: "OpenAI's Codex desktop app for managing coding agents",
        brewType: BrewType.CASK,
        category: Category.AI_CODING_TOOLS,
    },
    {
        id: 'block-goose-cli',
        name: 'Block Goose CLI',
        description: 'Open source, extensible AI agent that goes beyond code suggestions',
        brewType: BrewType.COMMAND,
        category: Category.AI_CODING_TOOLS,
    },
    {
        id: 'kiro',
        name: 'Kiro',
        description: 'Agent-centric IDE with spec-driven development',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'tlrc',
        name: 'tldr-pages',
        description:
            'Official tldr client written in Rust. The tldr-pages project is a collection of community-maintained help pages for command-line tools, that aims to be a simpler, more approachable complement to traditional man pages.',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'jq',
        name: 'jq',
        description: 'Lightweight and flexible command-line JSON processor',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'sd',
        name: 'sd',
        description: 'Intuitive find & replace CLI',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'ripgrep',
        name: 'ripgrep',
        description: 'Also known as: rg. Search tool like grep and The Silver Searcher',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'fd',
        name: 'fd',
        description:
            "Simple, fast and user-friendly alternative to find. While it does not aim to support all of find's powerful functionality, it provides sensible (opinionated) defaults for a majority of use cases.",
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'midnight-commander',
        name: 'midnight-commander',
        description: 'Also known as: mc. Terminal-based visual file manager',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'ranger',
        name: 'ranger',
        description: 'ranger is a console file manager with VI key bindings.',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'nnn',
        name: 'nnn',
        description: 'Tiny, lightning fast, feature-packed file manager',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'lazygit',
        name: 'lazygit',
        description: 'Simple terminal UI for git commands',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'bat',
        name: 'bat',
        description: 'Clone of cat(1) with syntax highlighting and Git integration',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'pcsx2',
        name: 'pcsx2',
        description: 'PCSX2 - Playstation 2 Emulator',
        brewType: BrewType.CASK,
        category: Category.GAMING,
    },
    // AI / Coding Tools
    {
        id: 'antigravity-cli',
        name: 'Antigravity CLI',
        description: 'CLI for Google DeepMind Antigravity AI agent',
        brewType: BrewType.CASK,
        category: Category.AI_CODING_TOOLS,
    },
    {
        id: 'cursor-cli',
        name: 'Cursor CLI',
        description: 'Command-line utility for the Cursor AI code editor',
        brewType: BrewType.CASK,
        category: Category.AI_CODING_TOOLS,
    },
    {
        id: 'devin-cli',
        name: 'Devin CLI',
        description: 'CLI for Devin Cloud agentic coding assistant',
        brewType: BrewType.CASK,
        category: Category.AI_CODING_TOOLS,
    },
    // Code Editors
    {
        id: 'antigravity-ide',
        name: 'Antigravity IDE',
        description: 'Standalone IDE for Google Antigravity AI-assisted development',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'devin-desktop',
        name: 'Devin Desktop',
        description: 'Agentic IDE with AI command center powered by Devin',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'helix',
        name: 'Helix',
        description: 'Post-modern modal text editor written in Rust with built-in LSP',
        brewType: BrewType.COMMAND,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'lapce',
        name: 'Lapce',
        description: 'Open-source code editor written in Rust with GPU-accelerated UI',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'coteditor',
        name: 'CotEditor',
        description: 'Plain-text editor for macOS ideal for web pages and source code',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'vscodium@insiders',
        name: 'VSCodium Insiders',
        description: 'Nightly telemetry-free VS Code build',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    // Note-taking
    {
        id: 'markedit',
        name: 'MarkEdit',
        description: 'Lightweight native Markdown editor for macOS',
        brewType: BrewType.CASK,
        category: Category.NOTE_TAKING,
    },
    // System Utils
    {
        id: 'qlmarkdown',
        name: 'sbarex QLMarkdown',
        description: 'Quick Look extension to preview Markdown files in Finder',
        brewType: BrewType.CASK,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'onyx',
        name: 'OnyX',
        description: 'System maintenance and configuration utility for macOS',
        brewType: BrewType.CASK,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'maintenance',
        name: 'Maintenance',
        description: 'Simplified macOS maintenance and cleaning utility by Titanium Software',
        brewType: BrewType.CASK,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'deeper',
        name: 'Deeper',
        description: 'Toggle hidden macOS features in Finder, Dock, Safari and more',
        brewType: BrewType.CASK,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'calhash',
        name: 'CalHash',
        description: 'Calculate and compare cryptographic file checksums on macOS',
        brewType: BrewType.CASK,
        category: Category.SYSTEM_UTILS,
    },
    // Developer Utilities
    {
        id: 'rtk',
        name: 'RTK',
        description: 'CLI proxy that minimizes LLM token consumption',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'awscli',
        name: 'AWS CLI',
        description: 'Official Amazon Web Services command-line interface',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    // Runtime Environments — Python
    {
        id: 'python@3.10',
        name: 'Python 3.10',
        description: 'Python programming language version 3.10',
        brewType: BrewType.COMMAND,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'python@3.11',
        name: 'Python 3.11',
        description: 'Python programming language version 3.11',
        brewType: BrewType.COMMAND,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'python@3.12',
        name: 'Python 3.12',
        description: 'Python programming language version 3.12',
        brewType: BrewType.COMMAND,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    // LLM Platforms
    {
        id: 'ollama',
        name: 'Ollama CLI',
        description: 'Command-line tool to run large language models locally',
        brewType: BrewType.COMMAND,
        category: Category.LLM_PLATFORMS,
    },
    // Runtime Environments — Eclipse Temurin JDK
    {
        id: 'temurin@8',
        name: 'Eclipse Temurin 8',
        description: 'OpenJDK 8 distribution by Adoptium (Eclipse Temurin)',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'temurin@11',
        name: 'Eclipse Temurin 11',
        description: 'OpenJDK 11 distribution by Adoptium (Eclipse Temurin)',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'temurin@17',
        name: 'Eclipse Temurin 17',
        description: 'OpenJDK 17 distribution by Adoptium (Eclipse Temurin)',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'temurin@21',
        name: 'Eclipse Temurin 21',
        description: 'OpenJDK 21 distribution by Adoptium (Eclipse Temurin)',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'temurin@25',
        name: 'Eclipse Temurin 25',
        description: 'OpenJDK 25 distribution by Adoptium (Eclipse Temurin)',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    // Runtime Environments — Microsoft OpenJDK
    {
        id: 'microsoft-openjdk@11',
        name: 'Microsoft OpenJDK 11',
        description: 'Microsoft Build of OpenJDK 11',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'microsoft-openjdk@17',
        name: 'Microsoft OpenJDK 17',
        description: 'Microsoft Build of OpenJDK 17',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'microsoft-openjdk@21',
        name: 'Microsoft OpenJDK 21',
        description: 'Microsoft Build of OpenJDK 21',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'microsoft-openjdk@25',
        name: 'Microsoft OpenJDK 25',
        description: 'Microsoft Build of OpenJDK 25',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    // Runtime Environments — Azul Zulu JDK
    {
        id: 'zulu@8',
        name: 'Azul Zulu 8',
        description: 'OpenJDK 8 distribution by Azul Systems (Zulu)',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'zulu@11',
        name: 'Azul Zulu 11',
        description: 'OpenJDK 11 distribution by Azul Systems (Zulu)',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'zulu@17',
        name: 'Azul Zulu 17',
        description: 'OpenJDK 17 distribution by Azul Systems (Zulu)',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'zulu@21',
        name: 'Azul Zulu 21',
        description: 'OpenJDK 21 distribution by Azul Systems (Zulu)',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'zulu@25',
        name: 'Azul Zulu 25',
        description: 'OpenJDK 25 distribution by Azul Systems (Zulu)',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    // Graphics & 3D
    {
        id: 'mochi-diffusion',
        name: 'Mochi Diffusion',
        description: 'Run Stable Diffusion natively on Apple Silicon via Core ML',
        brewType: BrewType.CASK,
        category: Category.GRAPHICS_AND_3D,
    },
    {
        id: 'diffusionbee',
        name: 'Diffusion Bee',
        description: 'Easy-to-use app to run Stable Diffusion locally on Mac',
        brewType: BrewType.CASK,
        category: Category.GRAPHICS_AND_3D,
    },
    {
        id: 'draw-things',
        name: 'Draw Things',
        description: 'Run Stable Diffusion models locally on macOS and iOS',
        brewType: BrewType.CASK,
        category: Category.GRAPHICS_AND_3D,
    },
    // Document Editors
    {
        id: 'wpsoffice',
        name: 'WPS Office',
        description: 'All-in-one office suite with high Microsoft Office compatibility',
        brewType: BrewType.CASK,
        category: Category.DOCUMENT_EDITORS,
    },
    // Media Players
    {
        id: 'foobar2000',
        name: 'foobar2000',
        description: 'Highly customizable audio player with low memory usage',
        brewType: BrewType.CASK,
        category: Category.MEDIA_PLAYERS,
    },
    {
        id: 'audacious',
        name: 'Audacious',
        description: 'Lightweight open-source audio player with plugin support',
        brewType: BrewType.COMMAND,
        category: Category.MEDIA_PLAYERS,
    },
    {
        id: 'mpv',
        name: 'mpv',
        description: 'Free open-source media player based on MPlayer',
        brewType: BrewType.COMMAND,
        category: Category.MEDIA_PLAYERS,
    },
    {
        id: 'handbrake',
        name: 'HandBrake',
        description: 'Open-source video transcoder supporting nearly all formats',
        brewType: BrewType.COMMAND,
        category: Category.MEDIA_PLAYERS,
    },
    // Browsers
    {
        id: 'vivaldi',
        name: 'Vivaldi',
        description: 'Highly customizable browser with built-in email and tab management',
        brewType: BrewType.CASK,
        category: Category.BROWSERS,
    },
    {
        id: 'waterfox',
        name: 'Waterfox',
        description: 'Privacy-centric Firefox-based browser with minimal telemetry',
        brewType: BrewType.CASK,
        category: Category.BROWSERS,
    },
    // Communication
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        description: 'Native desktop client for WhatsApp messaging',
        brewType: BrewType.CASK,
        category: Category.COMMUNICATION,
    },
    {
        id: 'slack',
        name: 'Slack',
        description: 'Team communication platform with channel-based messaging',
        brewType: BrewType.CASK,
        category: Category.COMMUNICATION,
    },
];

/**
 * Maps an application to a corresponding command for installation.
 *
 * This function determines whether the given application is of type `BrewType.COMMAND`
 * or `BrewType.CASK` and constructs the appropriate Homebrew install command.
 *
 * @param app - The application object containing details about the application to be installed.
 * @returns An object representing the command with a description and the actual installation command string.
 */
export function mapApplicationToCommand(app: Application): Command {
    const brewCommandInstall: string = 'brew install';
    const brewCaskInstall: string = 'brew install --cask';
    return {
        description: app.name,
        command: app.brewType === BrewType.COMMAND ? `${brewCommandInstall} ${app.id}` : `${brewCaskInstall} ${app.id}`,
    };
}

/**
 * The official URL for Homebrew, a package manager for macOS.
 * This constant is used to reference the Homebrew website where users can find installation instructions and resources.
 */
export const MAC_OS_BREW_HOME_LINK = 'https://brew.sh/';
/**
 * The shell script command used to install Homebrew on macOS.
 * This command executes a bash script that downloads and runs the Homebrew installation process
 * from the official GitHub repository.
 */
export const MAC_OS_BREW_INSTALL_SCRIPT =
    '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';
/**
 * A command string to create a `.zprofile` file in the user's home directory on macOS.
 * This is typically used to set up environment variables or aliases specific to the shell session.
 */
export const MAC_OS_CREATE_ZPROFILE = 'cd ~ && touch .zprofile';
/**
 * This constant represents a shell command that appends the Homebrew shell environment to the user's profile.
 * The command ensures that Homebrew is initialized in new shell sessions, making its binaries available in the PATH.
 */
export const MAC_OS_BREW_ADD_TO_PROFILE = `echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/ok/.zprofile`;
/**
 * A command to verify the installation of Homebrew on macOS systems.
 * This command runs `brew doctor`, which checks for potential issues in the Homebrew installation and environment.
 */
export const MAC_OS_BREW_VERIFY_INSTALLATION = 'brew doctor';
/**
 * Represents the command to update, upgrade, and clean up Homebrew packages on macOS.
 * This command ensures that all installed Homebrew formulas are up to date,
 * removes outdated versions of installed formulae, and cleans up cached downloads.
 */
export const MAC_OS_BREW_UPDATE_UPGRADE = ' brew update && brew upgrade && brew autoremove && brew cleanup\n';

export const VRAM_SCRIPT_CONTENT = `#!/usr/bin/env bash

# =========================================================
# Apple Silicon VRAM / Wired Memory Manager
# =========================================================
#
# Changes:
#   iogpu.wired_limit_mb
#
# Supported presets:
#   4GB
#   8GB
#   16GB
#   24GB
#   26GB (default)
#   28GB
#
# Features:
#   - Apple Silicon detection
#   - Safe validation
#   - RAM safety checks
#   - Interactive UI
#   - Current value display
#   - Verification after apply
#   - Dry-run mode
#   - Reset mode
#
# =========================================================

set -uo pipefail

# ---------------------------------------------------------
# COLORS
# ---------------------------------------------------------

RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
CYAN='\\033[0;36m'
MAGENTA='\\033[0;35m'
BOLD='\\033[1m'
NC='\\033[0m'

# ---------------------------------------------------------
# PRESETS
# ---------------------------------------------------------

declare -A PRESETS=(
    ["4"]=4096
    ["8"]=8192
    ["16"]=16384
    ["24"]=24576
    ["26"]=26624
    ["28"]=28672
)

DEFAULT_PRESET="26"

# ---------------------------------------------------------
# UI HELPERS
# ---------------------------------------------------------

header() {
    echo
    echo -e "\${BOLD}\${CYAN}=================================================\${NC}"
    echo -e "\${BOLD}\${CYAN}$1\${NC}"
    echo -e "\${BOLD}\${CYAN}=================================================\${NC}"
}

info() {
    echo -e "\${BLUE}▶ $1\${NC}"
}

success() {
    echo -e "\${GREEN}✔ $1\${NC}"
}

warn() {
    echo -e "\${YELLOW}⚠ $1\${NC}"
}

error() {
    echo -e "\${RED}✖ $1\${NC}"
}

# ---------------------------------------------------------
# HELP
# ---------------------------------------------------------

show_help() {
    cat <<EOF

Usage:
  ./set-vram.sh
  ./set-vram.sh 16
  ./set-vram.sh 24
  ./set-vram.sh --reset
  ./set-vram.sh --current
  ./set-vram.sh --dry-run 28

Available presets:
  4   -> 4GB
  8   -> 8GB
  16  -> 16GB
  24  -> 24GB
  26  -> 26GB (default)
  28  -> 28GB

Options:
  --current     Show current configured limit
  --reset       Reset to macOS default behavior
  --dry-run     Show what would happen
  --help        Show this help

Examples:
  ./set-vram.sh
  ./set-vram.sh 16
  ./set-vram.sh --dry-run 28

EOF
}

# ---------------------------------------------------------
# SYSTEM CHECKS
# ---------------------------------------------------------

is_apple_silicon() {
    [[ "$(uname -m)" == "arm64" ]]
}

get_total_ram_mb() {
    local bytes
    bytes=$(sysctl -n hw.memsize)
    echo $((bytes / 1024 / 1024))
}

get_current_limit() {
    sysctl -n iogpu.wired_limit_mb 2>/dev/null || echo "0"
}

# ---------------------------------------------------------
# VALIDATION
# ---------------------------------------------------------

validate_memory_limit() {

    local requested_mb="$1"
    local total_ram_mb

    total_ram_mb=$(get_total_ram_mb)

    # Keep at least 4GB free for macOS
    local safe_limit=$((total_ram_mb - 4096))

    if (( requested_mb >= safe_limit )); then
        error "Requested VRAM limit is too high for this Mac"
        echo
        echo "Total RAM:      $((total_ram_mb / 1024)) GB"
        echo "Requested:      $((requested_mb / 1024)) GB"
        echo "Recommended max: $((safe_limit / 1024)) GB"
        echo
        exit 1
    fi
}

# ---------------------------------------------------------
# APPLY
# ---------------------------------------------------------

apply_limit() {

    local limit_mb="$1"
    local dry_run="\${2:-false}"

    header "Applying VRAM Limit"

    info "Requested VRAM: $((limit_mb / 1024)) GB"
    info "Value in MB:    \${limit_mb}"

    echo

    if [[ "$dry_run" == "true" ]]; then
        warn "DRY RUN MODE — no changes made"
        return 0
    fi

    sudo sysctl iogpu.wired_limit_mb="\${limit_mb}"

    local applied
    applied=$(get_current_limit)

    echo

    if [[ "$applied" == "$limit_mb" ]]; then
        success "VRAM limit applied successfully"
    else
        error "Verification failed"
        exit 1
    fi
}

# ---------------------------------------------------------
# RESET
# ---------------------------------------------------------

reset_limit() {

    header "Reset VRAM Limit"

    info "Restoring macOS automatic behavior"

    sudo sysctl iogpu.wired_limit_mb=0

    echo

    local current
    current=$(get_current_limit)

    if [[ "$current" == "0" ]]; then
        success "VRAM limit reset successfully"
    else
        error "Reset verification failed"
        exit 1
    fi
}

# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------

clear

header "Apple Silicon VRAM Manager"

# Architecture check
if ! is_apple_silicon; then
    error "This script only supports Apple Silicon Macs"
    exit 1
fi

TOTAL_RAM_MB=$(get_total_ram_mb)
CURRENT_LIMIT=$(get_current_limit)

info "Detected Apple Silicon Mac"
info "Total RAM:       $((TOTAL_RAM_MB / 1024)) GB"

if [[ "$CURRENT_LIMIT" == "0" ]]; then
    info "Current limit:   macOS automatic"
else
    info "Current limit:   $((CURRENT_LIMIT / 1024)) GB"
fi

echo

# No arguments -> use default preset
if [[ $# -eq 0 ]]; then
    PRESET="$DEFAULT_PRESET"
    LIMIT_MB="\${PRESETS[$PRESET]}"

    validate_memory_limit "$LIMIT_MB"
    apply_limit "$LIMIT_MB"

    exit 0
fi

# Parse arguments
case "\${1:-}" in

    --help)
        show_help
        ;;

    --current)
        echo
        sysctl iogpu.wired_limit_mb
        ;;

    --reset)
        reset_limit
        ;;

    --dry-run)

        PRESET="\${2:-$DEFAULT_PRESET}"

        if [[ -z "\${PRESETS[$PRESET]:-}" ]]; then
            error "Invalid preset: $PRESET"
            exit 1
        fi

        LIMIT_MB="\${PRESETS[$PRESET]}"

        validate_memory_limit "$LIMIT_MB"
        apply_limit "$LIMIT_MB" true
        ;;

    *)

        PRESET="$1"

        if [[ -z "\${PRESETS[$PRESET]:-}" ]]; then
            error "Invalid preset: $PRESET"
            echo
            echo "Allowed presets: 4 8 16 24 26 28"
            exit 1
        fi

        LIMIT_MB="\${PRESETS[$PRESET]}"

        validate_memory_limit "$LIMIT_MB"
        apply_limit "$LIMIT_MB"
        ;;
esac
`;

const BREW_SCRIPT_BOILERPLATE_TOP = `#!/usr/bin/env bash

set -uo pipefail

START_TIME=$(date +%s)

SUCCESS_COUNT=0
FAILED_COUNT=0

RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
MAGENTA='\\033[0;35m'
CYAN='\\033[0;36m'
BOLD='\\033[1m'
NC='\\033[0m'

print_header() {
    echo
    echo -e "\${BOLD}\${CYAN}=================================================\${NC}"
    echo -e "\${BOLD}\${CYAN}$1\${NC}"
    echo -e "\${BOLD}\${CYAN}=================================================\${NC}"
}

print_step() {
    echo
    echo -e "\${BOLD}\${BLUE}▶ $1\${NC}"
}

print_success() {
    echo -e "\${GREEN}✔ $1\${NC}"
}

print_error() {
    echo -e "\${RED}✖ $1\${NC}"
}

run_task() {
    local name="$1"
    shift

    print_step "$name"

    if "$@"; then
        print_success "$name completed"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        print_error "$name failed"
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
}
`;

const BREW_SCRIPT_BOILERPLATE_BOTTOM = `
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

print_header "Summary"

echo -e "\${GREEN}Successful:\${NC} \${SUCCESS_COUNT}"
echo -e "\${RED}Failed:\${NC}     \${FAILED_COUNT}"

echo
echo -e "\${MAGENTA}Completed in:\${NC} \${DURATION}s"

echo
print_success "All tasks finished"
`;

export function generateBrewUpdateScript(formulaIds: string[]): string {
    const ids = formulaIds.join(' ');
    return (
        BREW_SCRIPT_BOILERPLATE_TOP +
        `
clear

print_header "Brew Formula Update"

echo -e "\${MAGENTA}Started:\${NC} $(date)"
echo

run_task "Brew Update" brew update

run_task "Brew Upgrade Formulas" brew upgrade ${ids}

run_task "Brew Autoremove" brew autoremove

run_task "Brew Cleanup" brew cleanup -s
` +
        BREW_SCRIPT_BOILERPLATE_BOTTOM
    );
}

export function generateBrewUpgradeScript(cascIds: string[]): string {
    const ids = cascIds.join(' ');
    return (
        BREW_SCRIPT_BOILERPLATE_TOP +
        `
clear

print_header "Brew Cask Upgrade"

echo -e "\${MAGENTA}Started:\${NC} $(date)"
echo

run_task "Brew Upgrade Casks" brew upgrade --cask ${ids}

run_task "Brew Autoremove" brew autoremove

run_task "Brew Cleanup" brew cleanup -s
` +
        BREW_SCRIPT_BOILERPLATE_BOTTOM
    );
}
