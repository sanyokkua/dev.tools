import {
    MAC_OS_BREW_ADD_TO_PROFILE,
    MAC_OS_BREW_HOME_LINK,
    MAC_OS_BREW_INSTALL_SCRIPT,
    MAC_OS_BREW_UPDATE_UPGRADE,
    MAC_OS_BREW_VERIFY_INSTALLATION,
    MAC_OS_CREATE_ZPROFILE,
} from '@/common/macos-utils';
import CodeSnippet from '@/elements/CodeSnippet';
import React from 'react';

interface StepProps {
    title: string;
    description: React.ReactNode;
    snippets: { header: string; content: string }[];
}

const Step: React.FC<StepProps> = ({ title, description, snippets }) => (
    <div>
        <h2>{title}</h2>
        <p>{description}</p>
        {snippets.map((s) => (
            <CodeSnippet key={s.header} headerText={s.header} content={s.content} language="bash" />
        ))}
    </div>
);

const BrewInstallSteps: React.FC = () => (
    <section>
        <Step
            title="1. Install Homebrew"
            description={
                <>
                    Visit the official docs:{' '}
                    <a href={MAC_OS_BREW_HOME_LINK} target="_blank" rel="noopener noreferrer">
                        brew.sh
                    </a>
                </>
            }
            snippets={[{ header: 'Install Script', content: MAC_OS_BREW_INSTALL_SCRIPT }]}
        />

        <Step
            title="2. Configure Shell Environment"
            description="Ensure you have a .zprofile, then add Homebrew to your PATH."
            snippets={[
                { header: 'Create .zprofile', content: MAC_OS_CREATE_ZPROFILE },
                { header: 'Add brew to PATH', content: MAC_OS_BREW_ADD_TO_PROFILE },
            ]}
        />

        <Step
            title="3. Verify Installation"
            description="Diagnose any issues with your Homebrew setup."
            snippets={[{ header: 'brew doctor', content: MAC_OS_BREW_VERIFY_INSTALLATION }]}
        />

        <Step
            title="4. Update & Maintenance"
            description="Keep everything up-to-date and clean."
            snippets={[{ header: 'Update & Upgrade', content: MAC_OS_BREW_UPDATE_UPGRADE }]}
        />
    </section>
);

export default React.memo(BrewInstallSteps);
