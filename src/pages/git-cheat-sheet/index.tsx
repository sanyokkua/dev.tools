'use client';

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
import { StringUtils } from 'coreutilsts';
import { FC, useEffect, useState } from 'react';
import CodeSnippet from '../../components/elements/CodeSnippet';
import ContentContainerFlex from '../../components/layouts/ContentContainerFlex';
import GitForm, { FormData } from '../../components/page-specific/git-cheat-sheet/git-form';
import GuideChooser from '../../components/page-specific/git-cheat-sheet/guide-chooser';

const GitCheatSheetPage: FC = () => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('Git Cheat Sheet');
    }, [setPageTitle]);

    const [chosenGuide, setChosenGuide] = useState<string>('');

    const [nameValue, setNameValue] = useState<string>('Your Name');
    const [emailValue, setEmailValue] = useState<string>('your@example.com');
    const [osType, setOsType] = useState<OSType>('macos');

    const [rawCommands, setRawCommands] = useState<string>('');
    const [singleLineCommands, setSingleLineCommands] = useState<string>('');
    const [detailedCommands, setDetailedCommands] = useState<{ description: string; command: string }[]>([]);

    const handleGenerate = (data: FormData) => {
        const { name, email, globalConfig, os } = data;
        setNameValue(name);
        setEmailValue(email);
        setOsType(os);
        if (name.trim().length === 0 || email.trim().length === 0) {
            setRawCommands('');
            setSingleLineCommands('');
            setDetailedCommands([]);
            return;
        }

        const commands = generateGitCommands(name, email, globalConfig, os);
        const allText = commands.map((cmd) => cmd.command).join('\n');
        const singleLine = commands.map((cmd) => cmd.command).join(' && ');

        setRawCommands(allText);
        setSingleLineCommands(singleLine);
        setDetailedCommands(commands);
    };

    const codeLanguage = osType === 'windows' ? 'powershell' : 'bash';

    const interactiveGuide = (
        <section>
            <h2>Interactive Command Generator</h2>
            <p>Fill in your details to generate customized Git setup commands:</p>
            <GitForm onSubmit={handleGenerate} />

            {rawCommands && (
                <>
                    <br />
                    <CodeSnippet
                        headerText="All Commands (replace placeholders)"
                        content={rawCommands}
                        language={codeLanguage}
                    />
                    {detailedCommands.map((cmd) => (
                        <CodeSnippet
                            key={StringUtils.slugifyString(cmd.description)}
                            headerText={cmd.description}
                            content={cmd.command}
                            language={codeLanguage}
                        />
                    ))}
                    <CodeSnippet
                        headerText="Single-Line Command (chain with &&)"
                        content={singleLineCommands}
                        language={codeLanguage}
                    />
                </>
            )}
        </section>
    );
    const manualGuide = (
        <section>
            <h2>Manual Setup Guide</h2>

            <h3>1. Install Git</h3>
            <p>
                Download Git from <a href="https://git-scm.com/downloads">git-scm.com/downloads</a> or use:
            </p>
            <CodeSnippet headerText="macOS (Homebrew)" content={GIT_INSTALL_MACOS} language="bash" />
            <CodeSnippet headerText="Windows (Winget)" content={GIT_INSTALL_WINDOWS} language="powershell" />
            <CodeSnippet headerText="Ubuntu/Debian" content={GIT_INSTALL_LINUX} language="bash" />
            <CodeSnippet headerText="Verify Installation" content={GIT_VERIFY_INSTALL} language="bash" />

            <h3>2. Configure User Info</h3>
            <CodeSnippet
                headerText="Set Local Username"
                content={`${GIT_CONFIG_USER_NAME} \"${nameValue}\"`}
                language="bash"
            />
            <CodeSnippet
                headerText="Set Global Username"
                content={`${GIT_CONFIG_GLOBAL_USER_NAME} \"${nameValue}\"`}
                language="bash"
            />
            <CodeSnippet
                headerText="Set Local Email"
                content={`${GIT_CONFIG_USER_EMAIL} \"${emailValue}\"`}
                language="bash"
            />
            <CodeSnippet
                headerText="Set Global Email"
                content={`${GIT_CONFIG_GLOBAL_USER_EMAIL} \"${emailValue}\"`}
                language="bash"
            />
            <CodeSnippet headerText="List Local Config" content={GIT_CONFIG_VERIFY} language="bash" />
            <CodeSnippet headerText="List Global Config" content={GIT_CONFIG_GLOBAL_VERIFY} language="bash" />

            <h3>3. Optional: SSH Key Setup</h3>
            <CodeSnippet
                headerText="Generate SSH Key"
                content={`${SSH_KEY_GENERATE} \"${emailValue}\"`}
                language="bash"
            />
            <CodeSnippet headerText="Start SSH Agent & Add Key" content={SSH_KEY_ADD_AGENT} language="bash" />
            <CodeSnippet headerText="Copy Public Key (macOS)" content={SSH_KEY_COPY_PUBLIC_KEY_MACOS} language="bash" />
            <CodeSnippet headerText="Install xclip (Linux)" content={INSTALL_XCLIP} language="bash" />
            <CodeSnippet headerText="Copy Public Key (Linux)" content={SSH_KEY_COPY_PUBLIC_KEY_LINUX} language="bash" />
            <CodeSnippet
                headerText="Copy Public Key (Windows)"
                content={SSH_KEY_COPY_PUBLIC_KEY_WINDOWS}
                language="powershell"
            />

            <h3>4. Optional: GPG Commit Signing</h3>
            <CodeSnippet headerText="Install GPG (macOS)" content={GPG_INSTALL_MACOS} language="bash" />
            <CodeSnippet headerText="Install GPG (Linux)" content={GPG_INSTALL_LINUX} language="bash" />
            <CodeSnippet headerText="Install GPG (Windows)" content={GPG_INSTALL_WINDOWS} language="powershell" />
            <CodeSnippet headerText="Generate GPG Key" content={GPG_GENERATE_KEY} language="bash" />
            <CodeSnippet headerText="List Secret Keys" content={GPG_GET_KEY_ID} language="bash" />
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

            <h3>5. Verify Setup</h3>
            <CodeSnippet headerText="Test SSH Connection" content={SSH_KEY_TEST} language="bash" />
            <CodeSnippet headerText="Test GPG Setup" content={GPG_VERIFY_INSTALL} language="bash" />
        </section>
    );

    function handleGuideChosen(value: string) {
        setChosenGuide(value);
    }

    let guide = null;
    if (chosenGuide === 'manual') {
        guide = manualGuide;
    } else if (chosenGuide === 'interactive') {
        guide = interactiveGuide;
    } else {
        guide = null;
    }

    return (
        <ContentContainerFlex>
            <section>
                <h1>Git Cheat Sheet</h1>
                <div>
                    <p>On this page you can find instruction on how to configure Git on your local machine</p>
                    <p>Chose the version of the Guide you would like to see:</p>
                    <br />
                    <GuideChooser
                        options={[
                            { label: 'Interactive Guide', value: 'interactive' },
                            { label: 'Manual Guide', value: 'manual' },
                        ]}
                        selectedValue={chosenGuide}
                        onChange={handleGuideChosen}
                    />
                </div>

                <br />
                {guide}
            </section>
        </ContentContainerFlex>
    );
};

export default GitCheatSheetPage;
