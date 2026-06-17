import {
    generateGitCommands,
    GIT_CONFIG_GLOBAL_USER_EMAIL,
    GIT_CONFIG_GLOBAL_USER_NAME,
    GIT_CONFIG_GLOBAL_VERIFY,
    GIT_CONFIG_USER_EMAIL,
    GIT_CONFIG_USER_NAME,
    GIT_CONFIG_VERIFY,
    GIT_INSTALL_LINUX,
    GIT_INSTALL_MACOS,
    GIT_INSTALL_WINDOWS,
    GIT_VERIFY_INSTALL,
    GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ADD_KEY,
    GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ENABLE_COMMIT_SIGNING,
    GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ENABLE_TAG_SIGNING,
    GPG_CONFIGURE_GIT_SIGNING_ADD_KEY,
    GPG_CONFIGURE_GIT_SIGNING_ENABLE_COMMIT_SIGNING,
    GPG_CONFIGURE_GIT_SIGNING_ENABLE_TAG_SIGNING,
    GPG_GENERATE_KEY,
    GPG_GET_KEY_ID,
    GPG_INSTALL_LINUX,
    GPG_INSTALL_MACOS,
    GPG_INSTALL_WINDOWS,
    GPG_PINENTRY_ADD_EXPORT_TO_PROFILE,
    GPG_PINENTRY_INSTALL,
    GPG_PINENTRY_SETUP_ADD_AGENT_RECORD,
    GPG_PINENTRY_SETUP_ADD_AGENT_TO_CONFIG,
    GPG_PINENTRY_SETUP_MKDIR_GNUPG,
    GPG_VERIFY_INSTALL,
    INSTALL_XCLIP,
    SSH_KEY_ADD_AGENT,
    SSH_KEY_COPY_PUBLIC_KEY_LINUX,
    SSH_KEY_COPY_PUBLIC_KEY_MACOS,
    SSH_KEY_COPY_PUBLIC_KEY_WINDOWS,
    SSH_KEY_GENERATE,
    SSH_KEY_TEST,
} from '@/common/git-utils';
import { OSType } from '@/common/types';
import { usePage } from '@/contexts/PageContext';
import SegmentedControl, { type SegmentedOption } from '@/controls/SegmentedControl';
import ToolAbout from '@/controls/ToolAbout';
import { StringUtils } from 'coreutilsts';
import { FC, useEffect, useState } from 'react';
import CodeSnippet from '../../components/elements/CodeSnippet';
import ContentContainerFlex from '../../components/layouts/ContentContainerFlex';
import GitForm, { FormData } from '../../components/page-specific/git-cheat-sheet/git-form';

const MODE_OPTIONS: SegmentedOption[] = [
    { value: 'interactive', label: 'Interactive (automatic)' },
    { value: 'manual', label: 'Manual (step-by-step)' },
];

const MANUAL_OS_OPTIONS: SegmentedOption[] = [
    { value: 'macos', label: 'macOS' },
    { value: 'windows', label: 'Windows' },
    { value: 'linux', label: 'Ubuntu/Debian' },
];

const GitCheatSheetPage: FC = () => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('Git Cheat-sheet');
    }, [setPageTitle]);

    const [chosenGuide, setChosenGuide] = useState<string>('interactive');
    const [manualOs, setManualOs] = useState<OSType>('macos');

    const [nameValue, setNameValue] = useState<string>('Your Name');
    const [emailValue, setEmailValue] = useState<string>('your@example.com');
    const [osType, setOsType] = useState<OSType>('macos');
    const [singleLineCommands, setSingleLineCommands] = useState<string>('');
    const [detailedCommands, setDetailedCommands] = useState<{ description: string; command: string }[]>([]);

    const handleGenerate = (data: FormData): void => {
        const { name, email, globalConfig, os } = data;
        setNameValue(name);
        setEmailValue(email);
        setOsType(os);
        if (name.trim().length === 0 || email.trim().length === 0) {
            setSingleLineCommands('');
            setDetailedCommands([]);
            return;
        }
        const commands = generateGitCommands(name, email, globalConfig, os);
        setSingleLineCommands(commands.map((cmd) => cmd.command).join(' && '));
        setDetailedCommands(commands);
    };

    const codeLanguage = osType === 'windows' ? 'powershell' : 'bash';

    const interactiveGuide = (
        <div className="git-cheat-sheet__interactive">
            <GitForm onSubmit={handleGenerate} />
            <div className="git-cheat-sheet__output-col">
                {singleLineCommands ? (
                    <>
                        <CodeSnippet
                            headerText="All commands (single-line, &&-chained)"
                            content={singleLineCommands}
                            language={codeLanguage}
                        />
                        {detailedCommands.map((cmd, idx) => (
                            <CodeSnippet
                                key={`${idx}-${StringUtils.slugifyString(cmd.description)}`}
                                headerText={cmd.description}
                                content={cmd.command}
                                language={codeLanguage}
                            />
                        ))}
                    </>
                ) : (
                    <p className="git-cheat-sheet__empty-hint">
                        Fill in the form and click Generate to see your commands.
                    </p>
                )}
            </div>
        </div>
    );

    const manualGuide = (
        <div className="git-cheat-sheet__manual">
            {/* 1. Install Git */}
            <div className="git-cheat-sheet__manual-step">
                <h3>1. Install Git</h3>
                <p>
                    Download Git from{' '}
                    <a href="https://git-scm.com/downloads" target="_blank" rel="noreferrer">
                        git-scm.com/downloads
                    </a>{' '}
                    or use:
                </p>
                <div className="git-cheat-sheet__os-bar">
                    <SegmentedControl
                        options={MANUAL_OS_OPTIONS}
                        value={manualOs}
                        onChange={(v) => setManualOs(v as OSType)}
                        aria-label="Install OS"
                    />
                </div>
                {manualOs === 'macos' && (
                    <CodeSnippet headerText="macOS (Homebrew)" content={GIT_INSTALL_MACOS} language="bash" />
                )}
                {manualOs === 'windows' && (
                    <CodeSnippet headerText="Windows (Winget)" content={GIT_INSTALL_WINDOWS} language="powershell" />
                )}
                {manualOs === 'linux' && (
                    <CodeSnippet headerText="Ubuntu/Debian" content={GIT_INSTALL_LINUX} language="bash" />
                )}
                <CodeSnippet headerText="Verify Installation" content={GIT_VERIFY_INSTALL} language="bash" />
            </div>

            {/* 2. Configure User Info */}
            <div className="git-cheat-sheet__manual-step">
                <h3>2. Configure User Info</h3>
                <CodeSnippet
                    headerText="Set Local Username"
                    content={`${GIT_CONFIG_USER_NAME} "${nameValue}"`}
                    language="bash"
                />
                <CodeSnippet
                    headerText="Set Global Username"
                    content={`${GIT_CONFIG_GLOBAL_USER_NAME} "${nameValue}"`}
                    language="bash"
                />
                <CodeSnippet
                    headerText="Set Local Email"
                    content={`${GIT_CONFIG_USER_EMAIL} "${emailValue}"`}
                    language="bash"
                />
                <CodeSnippet
                    headerText="Set Global Email"
                    content={`${GIT_CONFIG_GLOBAL_USER_EMAIL} "${emailValue}"`}
                    language="bash"
                />
                <CodeSnippet headerText="List Local Config" content={GIT_CONFIG_VERIFY} language="bash" />
                <CodeSnippet headerText="List Global Config" content={GIT_CONFIG_GLOBAL_VERIFY} language="bash" />
            </div>

            {/* 3. SSH Key Setup */}
            <div className="git-cheat-sheet__manual-step">
                <h3>3. Optional: SSH Key Setup</h3>
                <CodeSnippet
                    headerText="Generate SSH Key"
                    content={`${SSH_KEY_GENERATE} "${emailValue}"`}
                    language="bash"
                />
                <CodeSnippet headerText="Start SSH Agent &amp; Add Key" content={SSH_KEY_ADD_AGENT} language="bash" />
                <CodeSnippet
                    headerText="Copy Public Key (macOS)"
                    content={SSH_KEY_COPY_PUBLIC_KEY_MACOS}
                    language="bash"
                />
                <CodeSnippet headerText="Install xclip (Linux)" content={INSTALL_XCLIP} language="bash" />
                <CodeSnippet
                    headerText="Copy Public Key (Linux)"
                    content={SSH_KEY_COPY_PUBLIC_KEY_LINUX}
                    language="bash"
                />
                <CodeSnippet
                    headerText="Copy Public Key (Windows)"
                    content={SSH_KEY_COPY_PUBLIC_KEY_WINDOWS}
                    language="powershell"
                />
            </div>

            {/* 4. GPG Commit Signing */}
            <div className="git-cheat-sheet__manual-step">
                <h3>4. Optional: GPG Commit Signing</h3>
                <CodeSnippet headerText="Install GPG (macOS)" content={GPG_INSTALL_MACOS} language="bash" />
                <CodeSnippet headerText="Install GPG (Linux)" content={GPG_INSTALL_LINUX} language="bash" />
                <CodeSnippet headerText="Install GPG (Windows)" content={GPG_INSTALL_WINDOWS} language="powershell" />
                <CodeSnippet headerText="Generate GPG Key" content={GPG_GENERATE_KEY} language="bash" />
                <CodeSnippet
                    headerText="List Secret Keys (and copy id, eg.: sec   rsa4096/YOUR_KEY_ID YYYY-MM-DD [SC])"
                    content={GPG_GET_KEY_ID}
                    language="bash"
                />
                <CodeSnippet
                    headerText="Configure Global Signing Key"
                    content={GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ADD_KEY}
                    language="bash"
                />
                <CodeSnippet
                    headerText="Enable Global Commit Signing"
                    content={GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ENABLE_COMMIT_SIGNING}
                    language="bash"
                />
                <CodeSnippet
                    headerText="Enable Global Tag Signing"
                    content={GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ENABLE_TAG_SIGNING}
                    language="bash"
                />
                <CodeSnippet
                    headerText="Configure Local Signing Key"
                    content={GPG_CONFIGURE_GIT_SIGNING_ADD_KEY}
                    language="bash"
                />
                <CodeSnippet
                    headerText="Enable Local Commit Signing"
                    content={GPG_CONFIGURE_GIT_SIGNING_ENABLE_COMMIT_SIGNING}
                    language="bash"
                />
                <CodeSnippet
                    headerText="Enable Local Tag Signing"
                    content={GPG_CONFIGURE_GIT_SIGNING_ENABLE_TAG_SIGNING}
                    language="bash"
                />
                <hr className="git-cheat-sheet__divider" />
                <CodeSnippet
                    headerText="(macOS) Install pinentry for visual GPG prompts"
                    content={GPG_PINENTRY_INSTALL}
                    language="bash"
                />
                <CodeSnippet
                    headerText="(macOS) Create GPG config folder (if it doesn't exist)"
                    content={GPG_PINENTRY_SETUP_MKDIR_GNUPG}
                    language="bash"
                />
                <CodeSnippet
                    headerText="(macOS) Add pinentry to gpg-agent config (if entry not present)"
                    content={GPG_PINENTRY_SETUP_ADD_AGENT_RECORD}
                    language="bash"
                />
                <CodeSnippet
                    headerText="(macOS) Add 'use-agent' to GPG config (if missing)"
                    content={GPG_PINENTRY_SETUP_ADD_AGENT_TO_CONFIG}
                    language="bash"
                />
                <CodeSnippet
                    headerText="(macOS) Add environment variable export to shell profile (~/.zprofile or ~/.bashrc or ~/.zshrc)"
                    content={GPG_PINENTRY_ADD_EXPORT_TO_PROFILE}
                    language="bash"
                />
            </div>

            {/* 5. Verify Setup */}
            <div className="git-cheat-sheet__manual-step">
                <h3>5. Verify Setup</h3>
                <CodeSnippet headerText="Test SSH Connection" content={SSH_KEY_TEST} language="bash" />
                <CodeSnippet headerText="Test GPG Setup" content={GPG_VERIFY_INSTALL} language="bash" />
            </div>
        </div>
    );

    return (
        <ContentContainerFlex>
            <ToolAbout routeKey="git-cheat-sheet">
                Configure Git, SSH and GPG either interactively (fill name/email/OS → generated commands) or with a
                manual step-by-step guide covering install, identity, SSH keys, and GPG commit signing, with links to
                GitHub/GitLab docs. Copy any block.
            </ToolAbout>
            <div className="git-cheat-sheet">
                <div className="git-cheat-sheet__header">
                    <h1>Git Cheat Sheet</h1>
                    <p>Configure Git, SSH and GPG. Official docs:</p>
                    <ul>
                        <li>
                            <a
                                href="https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent"
                                target="_blank"
                                rel="noreferrer"
                            >
                                GitHub SSH
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://docs.github.com/en/authentication/managing-commit-signature-verification/generating-a-new-gpg-key"
                                target="_blank"
                                rel="noreferrer"
                            >
                                GitHub GPG
                            </a>
                        </li>
                        <li>
                            <a href="https://docs.gitlab.com/user/ssh/" target="_blank" rel="noreferrer">
                                GitLab SSH
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://docs.gitlab.com/user/project/repository/signed_commits/gpg/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                GitLab GPG
                            </a>
                        </li>
                    </ul>
                </div>

                <div className="git-cheat-sheet__mode-bar">
                    <SegmentedControl
                        options={MODE_OPTIONS}
                        value={chosenGuide}
                        onChange={setChosenGuide}
                        aria-label="Guide mode"
                    />
                </div>

                {chosenGuide === 'interactive' && interactiveGuide}
                {chosenGuide === 'manual' && manualGuide}
            </div>
        </ContentContainerFlex>
    );
};

export default GitCheatSheetPage;
