import {
    LINUX_ENV_ADD_TO_PATH,
    LINUX_ENV_EXPORT_EXAMPLE,
    LINUX_ENV_JAVA_HOME,
    LINUX_ENV_RELOAD,
} from '@/common/linux-utils';
import CodeSnippet from '@/elements/CodeSnippet';
import React from 'react';

const EnvironmentVariablesSection: React.FC = () => (
    <section>
        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">1</span> Set an environment variable
            </div>
            <p>
                Use <code>export</code> to set a variable for the current session. Add it to <code>~/.bashrc</code> or{' '}
                <code>~/.zshrc</code> to persist across sessions.
            </p>
            <CodeSnippet headerText="bash" content={LINUX_ENV_EXPORT_EXAMPLE} language="bash" />
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">2</span> Add a directory to PATH
            </div>
            <p>Prepend a directory so its binaries are found before system defaults.</p>
            <CodeSnippet headerText="bash" content={LINUX_ENV_ADD_TO_PATH} language="bash" />
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">3</span> Set JAVA_HOME
            </div>
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

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">4</span> Reload the shell profile
            </div>
            <p>Apply changes made to your shell profile without opening a new terminal.</p>
            <CodeSnippet headerText="bash" content={LINUX_ENV_RELOAD} language="bash" />
        </div>
    </section>
);

export default EnvironmentVariablesSection;
