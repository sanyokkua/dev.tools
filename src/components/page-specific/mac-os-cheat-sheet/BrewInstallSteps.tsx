import {
    ADD_BREW_TO_PROFILE,
    BREW_UPDATE_UPGRADE,
    HOME_BREW_INSTALL_SCRIPT,
    HOME_BREW_LINK,
    MACOS_CREATE_ZPROFILE,
    VERIFY_BREW_INSTALLATION,
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
                    <a href={HOME_BREW_LINK} target="_blank" rel="noopener noreferrer">
                        brew.sh
                    </a>
                </>
            }
            snippets={[{ header: 'Install Script', content: HOME_BREW_INSTALL_SCRIPT }]}
        />

        <Step
            title="2. Configure Shell Environment"
            description="Ensure you have a .zprofile, then add Homebrew to your PATH."
            snippets={[
                { header: 'Create .zprofile', content: MACOS_CREATE_ZPROFILE },
                { header: 'Add brew to PATH', content: ADD_BREW_TO_PROFILE },
            ]}
        />

        <Step
            title="3. Verify Installation"
            description="Diagnose any issues with your Homebrew setup."
            snippets={[{ header: 'brew doctor', content: VERIFY_BREW_INSTALLATION }]}
        />

        <Step
            title="4. Update & Maintenance"
            description="Keep everything up-to-date and clean."
            snippets={[{ header: 'Update & Upgrade', content: BREW_UPDATE_UPGRADE }]}
        />
    </section>
);

export default React.memo(BrewInstallSteps);
