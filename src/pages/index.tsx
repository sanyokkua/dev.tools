import { usePage } from '@/contexts/PageContext';
import Link from 'next/link';
import { useEffect } from 'react';
import PageShell from '../components/layouts/PageShell';

interface ToolCard {
    name: string;
    route: string;
    icon: string;
    description: string;
    badge?: string;
}

interface ToolGroup {
    groupName: string;
    tools: ToolCard[];
}

const toolGroups: ToolGroup[] = [
    {
        groupName: 'Text & Code',
        tools: [
            {
                name: 'String Utils',
                route: '/string-utils',
                icon: 'Ⓢ',
                description: '20+ case, slugify, and text transforms via a 3-pane editor',
            },
            {
                name: 'JSON Formatter',
                route: '/json-formatter',
                icon: '{}',
                description: 'Beautify or minify JSON with configurable indentation and sort',
            },
            {
                name: 'Hashing Tools',
                route: '/hashing-tools',
                icon: '#',
                description: 'MD5, SHA-1, SHA-256, SHA-512 hashes in real time',
            },
            {
                name: 'Encoding Tools',
                route: '/encoding-tools',
                icon: '⇄',
                description: 'Base64, URL, HTML, and Unicode encode and decode',
            },
            {
                name: 'Terminal Utils',
                route: '/terminal-utils',
                icon: '>_',
                description: 'Join shell commands into a single line with & or &&',
            },
            {
                name: 'Code Editor',
                route: '/code-editor',
                icon: '‹›',
                description: 'Edit code with Monaco syntax highlighting and file open/save',
            },
            {
                name: 'Markdown Tools',
                route: '/markdown-tools',
                icon: '¶',
                description: 'Write, preview, and export Markdown to PDF',
            },
            {
                name: 'Converting Tools',
                route: '/converting-tools',
                icon: '⇆',
                description: 'Unit and data conversions across common scales',
            },
            {
                name: 'Date Tools',
                route: '/date-tools',
                icon: '◷',
                description: 'Date formatting, difference, and epoch utilities',
            },
        ],
    },
    {
        groupName: 'Install & Setup',
        tools: [
            {
                name: 'Software Installer',
                route: '/software-installer',
                icon: '⚙',
                description: 'Generate install, update, and remove scripts for any OS',
            },
            {
                name: 'macOS Setup',
                route: '/mac-os-setup',
                icon: '⌘',
                description: 'Package managers, env vars, and platform scripts for macOS',
            },
            {
                name: 'Windows Setup',
                route: '/windows-setup',
                icon: '⊞',
                description: 'Development environment setup guides for Windows',
            },
            {
                name: 'Linux Setup',
                route: '/linux-setup',
                icon: '🐧',
                description: 'Package manager setup and env configuration for Linux',
            },
            {
                name: 'Git Cheat-sheet',
                route: '/git-cheat-sheet',
                icon: '⎇',
                description: 'Interactive or manual Git, SSH, and GPG setup commands',
            },
        ],
    },
    {
        groupName: 'AI',
        tools: [
            {
                name: 'LLM VRAM Calculator',
                route: '/llm-vram-calculator',
                icon: '▤',
                description: 'Estimate GPU or unified memory for GGUF-quantized LLMs',
            },
            {
                name: 'Prompts Collection',
                route: '/prompts-collection',
                icon: '❝',
                description: 'Browse, filter, and build parametrized prompts',
            },
        ],
    },
];

const Home = (): React.JSX.Element => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Dashboard');
    }, [setPageTitle]);

    return (
        <PageShell>
            <div className="dashboard-hero">
                <h1>Welcome to dev.tools</h1>
                <p>A browser-based toolkit for developers. All operations run locally — no data leaves your browser.</p>
                <p>
                    Source code available on{' '}
                    <a target="_blank" rel="noreferrer" href="https://github.com/sanyokkua/dev.tools">
                        GitHub
                    </a>
                    .
                </p>
                <div className="dashboard-pills">
                    <span className="dashboard-pill dashboard-pill--ok">● Offline-ready</span>
                    <span className="dashboard-pill">No tracking · No backend</span>
                    <span className="dashboard-pill">Static export · GitHub Pages</span>
                </div>
            </div>

            {toolGroups.map((group) => (
                <section key={group.groupName} className="dashboard-group">
                    <div className="dashboard-group-label">{group.groupName}</div>
                    <div className="dashboard-grid">
                        {group.tools.map((tool) => (
                            <Link key={tool.route} href={tool.route} className="dashboard-card">
                                <span className="dashboard-card-icon">{tool.icon}</span>
                                <div className="dashboard-card-body">
                                    <div className="dashboard-card-name">
                                        {tool.name}
                                        {tool.badge && <span className="dashboard-card-badge">{tool.badge}</span>}
                                    </div>
                                    <div className="dashboard-card-desc">{tool.description}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            ))}
        </PageShell>
    );
};

export default Home;
