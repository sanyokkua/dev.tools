import CodeSnippet from '@/elements/CodeSnippet';
import React from 'react';

const JAVA_HOME_EXAMPLE = `echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 21)' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc`;

const PATH_GENERIC_EXAMPLE = `# Add a directory to PATH (replace /your/tool/bin)
echo 'export PATH="/your/tool/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc`;

const EnvironmentVariablesSection: React.FC = () => (
    <section>
        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">1</span> Set an environment variable
            </div>
            <p>Example: JAVA_HOME — set Java version for the shell session.</p>
            <CodeSnippet headerText="~/.zshrc" content={JAVA_HOME_EXAMPLE} language="bash" />
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">2</span> Add a directory to PATH
            </div>
            <CodeSnippet headerText="~/.zshrc" content={PATH_GENERIC_EXAMPLE} language="bash" />
            <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginTop: 8 }}>
                Common shell profiles: <code>~/.zprofile</code> (login shell), <code>~/.zshrc</code> (interactive zsh —
                macOS default since Catalina), <code>~/.bashrc</code> (bash).
            </p>
        </div>
    </section>
);

export default EnvironmentVariablesSection;
