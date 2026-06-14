import {
    WINDOWS_ENV_ADD_TO_PATH,
    WINDOWS_ENV_MACHINE_LEVEL,
    WINDOWS_ENV_SET_VARIABLE,
    WINDOWS_ENV_VIEW_VARIABLE,
} from '@/common/windows-utils';
import CodeSnippet from '@/elements/CodeSnippet';
import React from 'react';

const EnvironmentVariablesSection: React.FC = () => (
    <section>
        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">1</span> Set a user environment variable
            </div>
            <p>
                Example: <code>JAVA_HOME</code> — use <code>&quot;User&quot;</code> scope for the current user only (no
                admin required).
            </p>
            <CodeSnippet headerText="PowerShell" content={WINDOWS_ENV_SET_VARIABLE} language="powershell" />
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">2</span> Add a directory to PATH
            </div>
            <p>Read the current value, append your directory, and write it back.</p>
            <CodeSnippet headerText="PowerShell" content={WINDOWS_ENV_ADD_TO_PATH} language="powershell" />
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">3</span> Read an environment variable
            </div>
            <CodeSnippet headerText="PowerShell" content={WINDOWS_ENV_VIEW_VARIABLE} language="powershell" />
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">4</span> Machine-level variables (system-wide)
            </div>
            <CodeSnippet
                headerText="PowerShell (admin required)"
                content={WINDOWS_ENV_MACHINE_LEVEL}
                language="powershell"
            />
            <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginTop: 8 }}>
                GUI alternative:{' '}
                <strong>
                    Win + R → <code>sysdm.cpl</code> → Advanced → Environment Variables
                </strong>
                . Changes take effect in new shells.
            </p>
        </div>
    </section>
);

export default EnvironmentVariablesSection;
