import {
    MAC_OS_ENV_ADD_TO_PATH,
    MAC_OS_ENV_EXPORT_EXAMPLE,
    MAC_OS_ENV_JAVA_HOME,
    MAC_OS_ENV_LAUNCH_AGENT_LOAD,
    MAC_OS_ENV_LAUNCH_AGENT_PLIST,
    MAC_OS_ENV_LAUNCHCTL_CONFIG_PATH,
    MAC_OS_ENV_LAUNCHCTL_GETENV,
    MAC_OS_ENV_LAUNCHCTL_SETENV_SESSION,
    MAC_OS_ENV_PATHS_D,
} from '@/common/macos-utils';
import CodeSnippet from '@/elements/CodeSnippet';
import React from 'react';

const mutedNote: React.CSSProperties = { fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginTop: 8 };

const EnvironmentVariablesSection: React.FC = () => (
    <section>
        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">1</span> Set an environment variable — this Terminal session only
            </div>
            <p>
                <code>export</code> sets a variable in the current shell process. It disappears the moment the Terminal
                window or tab closes.
            </p>
            <CodeSnippet headerText="zsh" content={MAC_OS_ENV_EXPORT_EXAMPLE} language="bash" />
            <p style={mutedNote}>
                <strong>Reaches:</strong> this Terminal session only.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">2</span> Persist for your user — shell profile
            </div>
            <p>Example: JAVA_HOME — set the Java version for every future shell session.</p>
            <CodeSnippet headerText="~/.zshrc" content={MAC_OS_ENV_JAVA_HOME} language="bash" />
            <p style={mutedNote}>
                <strong>Reaches:</strong> your future Terminal sessions. <strong>Not</strong> GUI apps launched from
                Spotlight or the Dock — <code>launchd</code> spawns them directly, never through a login shell.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">3</span> Add a directory to PATH — shell profile
            </div>
            <CodeSnippet headerText="~/.zshrc" content={MAC_OS_ENV_ADD_TO_PATH} language="bash" />
            <p style={mutedNote}>
                Common shell profiles: <code>~/.zprofile</code> (login shell), <code>~/.zshrc</code> (interactive zsh —
                macOS default since Catalina), <code>~/.bashrc</code> (bash). <strong>Reaches:</strong> Terminal
                sessions only, same as above.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">4</span> Reach GUI apps right now — this login session only
            </div>
            <p>
                <code>launchctl setenv</code> writes straight into the launchd registry, so anything launched afterward
                — Dock, Spotlight, a new Terminal window — inherits it immediately, with no plist and no logout
                required.
            </p>
            <CodeSnippet headerText="Terminal" content={MAC_OS_ENV_LAUNCHCTL_SETENV_SESSION} language="bash" />
            <p style={mutedNote}>
                <strong>Reaches:</strong> GUI and CLI apps launched after this command, for the rest of this login
                session only — nothing is saved to disk, so it&apos;s gone after logout, restart, or reboot. A new{' '}
                <strong>tab</strong> in an already-running Terminal won&apos;t see it either, since tabs are children of
                the already-running process — you need a genuinely new Terminal launch. For a value that survives
                reboots, use the LaunchAgent below.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">5</span> Persist across reboots — create a LaunchAgent
            </div>
            <p>
                The persistent version of the previous step: a LaunchAgent with <code>RunAtLoad</code> re-runs{' '}
                <code>launchctl setenv</code> at every login, so the variable survives logout and reboot without you
                having to type the command again. There is no first-class Apple GUI for this — it&apos;s the de-facto
                community standard.
            </p>
            <CodeSnippet
                headerText="~/Library/LaunchAgents/setenv.MYVAR.plist"
                content={MAC_OS_ENV_LAUNCH_AGENT_PLIST}
                language="shell"
            />
            <p style={mutedNote}>
                <code>RunAtLoad</code> re-runs this command at every login, which is what makes the variable persist
                across reboots — running <code>launchctl setenv</code> alone in Terminal works immediately but is lost
                at the next reboot.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">6</span> Load and verify the LaunchAgent
            </div>
            <p>Load it immediately (or just log out and back in), then confirm launchd has the value.</p>
            <CodeSnippet headerText="bash" content={MAC_OS_ENV_LAUNCH_AGENT_LOAD} language="bash" />
            <CodeSnippet headerText="verify" content={MAC_OS_ENV_LAUNCHCTL_GETENV} language="bash" />
            <p style={mutedNote}>
                <strong>Reaches:</strong> GUI and CLI apps launched afterward, for your user. Already-running apps —
                including Terminal itself and the target app — do <strong>not</strong> pick up the change; fully quit
                and relaunch them.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">7</span> PATH-only shortcuts
            </div>
            <p>
                If you only need to extend PATH (not set an arbitrary variable), two lighter-weight mechanisms avoid
                writing a LaunchAgent.
            </p>
            <CodeSnippet
                headerText="/etc/paths.d — read at login by path_helper"
                content={MAC_OS_ENV_PATHS_D}
                language="bash"
            />
            <CodeSnippet
                headerText="launchctl config — per-user, requires reboot"
                content={MAC_OS_ENV_LAUNCHCTL_CONFIG_PATH}
                language="bash"
            />
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">8</span> All-users scope and SIP
            </div>
            <p>
                A LaunchDaemon in <code>/Library/LaunchDaemons</code> calling <code>launchctl setenv</code> runs in the
                system domain, but daemons run before any user logs in — rarely useful for GUI apps. Never make{' '}
                <code>/System/Library/LaunchDaemons</code> or its files writable; Apple warns this can render the system
                unbootable.
            </p>
            <p style={mutedNote}>
                System Integrity Protection strips <code>DYLD_*</code> (e.g. <code>DYLD_LIBRARY_PATH</code>) and{' '}
                <code>LD_*</code> variables when a protected process (App Store apps, hardened-runtime-signed apps,
                built-in system binaries) spawns children. No <code>launchctl</code>/LaunchAgent method can deliver
                these to protected apps.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">9</span> Deprecated — do not use
            </div>
            <p>
                <code>~/.MacOSX/environment.plist</code> stopped working after OS X 10.7 Lion.{' '}
                <code>/etc/launchd.conf</code> and <code>~/.launchd.conf</code> haven&apos;t been read since OS X 10.10
                Yosemite and don&apos;t even exist on modern macOS. Any tutorial recommending them will silently do
                nothing.
            </p>
        </div>
    </section>
);

export default EnvironmentVariablesSection;
