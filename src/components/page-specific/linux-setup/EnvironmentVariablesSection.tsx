import {
    LINUX_ENV_ADD_TO_PATH,
    LINUX_ENV_EXPORT_EXAMPLE,
    LINUX_ENV_JAVA_HOME,
    LINUX_ENV_RELOAD,
} from '@/common/linux-utils';
import CodeSnippet from '@/elements/CodeSnippet';
import React from 'react';

const EnvironmentVariablesSection: React.FC = () => (
    <section className="linux-setup__section">
        <div className="linux-setup__step">
            <h2>1. Set an environment variable</h2>
            <p>
                Use <code>export</code> to set a variable for the current session. Add it to <code>~/.bashrc</code> or{' '}
                <code>~/.zshrc</code> to persist across sessions.
            </p>
            <CodeSnippet headerText="bash" content={LINUX_ENV_EXPORT_EXAMPLE} language="bash" />
        </div>

        <div className="linux-setup__step">
            <h2>2. Add a directory to PATH</h2>
            <p>Prepend a directory so its binaries are found before system defaults.</p>
            <CodeSnippet headerText="bash" content={LINUX_ENV_ADD_TO_PATH} language="bash" />
        </div>

        <div className="linux-setup__step">
            <h2>3. Set JAVA_HOME</h2>
            <p>
                A concrete example: point <code>JAVA_HOME</code> at a JDK and add its <code>bin/</code> to PATH. Adjust
                the path to match your installed JDK version and architecture.
            </p>
            <CodeSnippet
                headerText="bash — add to ~/.bashrc or ~/.zshrc"
                content={LINUX_ENV_JAVA_HOME}
                language="bash"
            />
        </div>

        <div className="linux-setup__step">
            <h2>4. Reload the shell profile</h2>
            <p>Apply changes made to your shell profile without opening a new terminal.</p>
            <CodeSnippet headerText="bash" content={LINUX_ENV_RELOAD} language="bash" />
        </div>
    </section>
);

export default EnvironmentVariablesSection;
