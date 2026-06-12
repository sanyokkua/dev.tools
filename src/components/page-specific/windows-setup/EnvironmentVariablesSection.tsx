import {
    WINDOWS_ENV_ADD_TO_PATH,
    WINDOWS_ENV_MACHINE_LEVEL,
    WINDOWS_ENV_SET_VARIABLE,
    WINDOWS_ENV_VIEW_VARIABLE,
} from '@/common/windows-utils';
import CodeSnippet from '@/elements/CodeSnippet';
import React from 'react';

const EnvironmentVariablesSection: React.FC = () => (
    <section className="windows-setup__section">
        <div className="windows-setup__step">
            <h2>1. Set a user environment variable</h2>
            <p>
                Example: <code>JAVA_HOME</code> — use <code>&quot;User&quot;</code> scope for the current user only (no
                admin required).
            </p>
            <CodeSnippet headerText="PowerShell" content={WINDOWS_ENV_SET_VARIABLE} language="powershell" />
        </div>

        <div className="windows-setup__step">
            <h2>2. Add a directory to PATH</h2>
            <p>Read the current value, append your directory, and write it back.</p>
            <CodeSnippet headerText="PowerShell" content={WINDOWS_ENV_ADD_TO_PATH} language="powershell" />
        </div>

        <div className="windows-setup__step">
            <h2>3. Read an environment variable</h2>
            <CodeSnippet headerText="PowerShell" content={WINDOWS_ENV_VIEW_VARIABLE} language="powershell" />
        </div>

        <div className="windows-setup__step">
            <h2>4. Machine-level variables (system-wide)</h2>
            <CodeSnippet
                headerText="PowerShell (admin required)"
                content={WINDOWS_ENV_MACHINE_LEVEL}
                language="powershell"
            />
            <p className="windows-setup__hint">
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
