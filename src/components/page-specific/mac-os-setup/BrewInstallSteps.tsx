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
    n: number;
    title: string;
    description: React.ReactNode;
    snippets: { header: string; content: string }[];
}

const Step: React.FC<StepProps> = ({ n, title, description, snippets }) => (
    <div className="card pad" style={{ marginBottom: 16 }}>
        <div className="steplabel">
            <span className="n">{n}</span> {title}
        </div>
        <p>{description}</p>
        {snippets.map((s) => (
            <CodeSnippet key={s.header} headerText={s.header} content={s.content} language="bash" />
        ))}
    </div>
);

const BrewInstallSteps: React.FC = () => (
    <section>
        <Step
            n={1}
            title="Install Homebrew"
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
            n={2}
            title="Configure Shell Environment"
            description="Ensure you have a .zprofile, then add Homebrew to your PATH."
            snippets={[
                { header: 'Create .zprofile', content: MAC_OS_CREATE_ZPROFILE },
                { header: 'Add brew to PATH', content: MAC_OS_BREW_ADD_TO_PROFILE },
            ]}
        />

        <Step
            n={3}
            title="Verify Installation"
            description="Diagnose any issues with your Homebrew setup."
            snippets={[{ header: 'brew doctor', content: MAC_OS_BREW_VERIFY_INSTALLATION }]}
        />

        <Step
            n={4}
            title="Update & Maintenance"
            description="Keep everything up-to-date and clean."
            snippets={[{ header: 'Update & Upgrade', content: MAC_OS_BREW_UPDATE_UPGRADE }]}
        />
    </section>
);

export default React.memo(BrewInstallSteps);
