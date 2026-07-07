import {
    WINDOWS_ENV_ADD_TO_PATH,
    WINDOWS_ENV_GUI_EDITOR,
    WINDOWS_ENV_MACHINE_LEVEL,
    WINDOWS_ENV_REG_QUERY,
    WINDOWS_ENV_SAFE_PATH_APPEND_MACHINE,
    WINDOWS_ENV_SESSION_ONLY,
    WINDOWS_ENV_SET_VARIABLE,
    WINDOWS_ENV_VIEW_VARIABLE,
} from '@/common/windows-utils';
import CodeSnippet from '@/elements/CodeSnippet';
import React from 'react';

const mutedNote: React.CSSProperties = { fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginTop: 8 };

const EnvironmentVariablesSection: React.FC = () => (
    <section>
        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">1</span> Session only — current PowerShell window
            </div>
            <p>
                <code>$env:</code> sets a variable for the current process only. It is <strong>not</strong> the same as{' '}
                <code>[Environment]::SetEnvironmentVariable</code> — nothing is written to the registry, so it is lost
                the moment the window closes.
            </p>
            <CodeSnippet headerText="PowerShell" content={WINDOWS_ENV_SESSION_ONLY} language="powershell" />
            <p style={mutedNote}>
                <strong>Reaches:</strong> this PowerShell window only.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">2</span> Persist for current user
            </div>
            <p>
                Example: <code>JAVA_HOME</code> — use <code>&quot;User&quot;</code> scope for the current user only (no
                admin required). This writes the same registry key the System Properties GUI does and broadcasts{' '}
                <code>WM_SETTINGCHANGE</code> so Explorer picks it up for apps launched afterward.
            </p>
            <CodeSnippet headerText="PowerShell" content={WINDOWS_ENV_SET_VARIABLE} language="powershell" />
            <p style={mutedNote}>
                <strong>Reaches:</strong> new processes for your user (new shells, Start-menu launches) — not
                already-running apps.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">3</span> Add a directory to PATH
            </div>
            <p>Read the current value, append your directory, and write it back — safe for values of any length.</p>
            <CodeSnippet headerText="PowerShell" content={WINDOWS_ENV_ADD_TO_PATH} language="powershell" />
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">4</span> Read a variable at a specific scope
            </div>
            <CodeSnippet headerText="PowerShell" content={WINDOWS_ENV_VIEW_VARIABLE} language="powershell" />
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">5</span> Verify via the registry directly
            </div>
            <p>
                <code>$env:</code> shows the merged process view, which can hide which scope actually holds the value.
                Query the registry directly for an authoritative answer.
            </p>
            <CodeSnippet headerText="PowerShell" content={WINDOWS_ENV_REG_QUERY} language="powershell" />
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">6</span> Machine-level variables (system-wide)
            </div>
            <CodeSnippet
                headerText="PowerShell (admin required)"
                content={WINDOWS_ENV_MACHINE_LEVEL}
                language="powershell"
            />
            <p style={mutedNote}>
                <strong>Reaches:</strong> all users and all processes, once relaunched. Requires an elevated PowerShell
                session.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">7</span> Avoid setx for PATH
            </div>
            <p>
                <code>setx</code> persists a value but silently truncates it at 1024 characters, merges system and user
                PATH together, and can convert a <code>REG_EXPAND_SZ</code> entry to <code>REG_SZ</code> (losing{' '}
                <code>%SystemRoot%</code>-style placeholders). This is a documented, reported bug class — use the safe
                append pattern instead.
            </p>
            <CodeSnippet
                headerText="PowerShell (admin required)"
                content={WINDOWS_ENV_SAFE_PATH_APPEND_MACHINE}
                language="powershell"
            />
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">8</span> GUI editor shortcut
            </div>
            <CodeSnippet headerText="Run (Win + R)" content={WINDOWS_ENV_GUI_EDITOR} language="powershell" />
            <p style={mutedNote}>
                Equivalent to: <strong>System Properties → Advanced → Environment Variables</strong>. Works for
                non-admins editing their own User variables.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">9</span> Restart requirements and gotchas
            </div>
            <p>
                Every process gets a copy of its parent&apos;s environment at launch — a persisted change never reaches
                an already-running process. New Windows Terminal tabs are children of the same{' '}
                <code>WindowsTerminal.exe</code> process and inherit its old environment block — quit and relaunch the
                whole app, not just a tab. VS Code&apos;s integrated terminal inherits from VS Code itself — restart the
                whole window. Services and Docker Desktop read Machine scope only at their own startup — restart the
                service, not just a console.
            </p>
        </div>
    </section>
);

export default EnvironmentVariablesSection;
