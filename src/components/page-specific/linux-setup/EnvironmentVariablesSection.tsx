import {
    LINUX_ENV_ADD_TO_PATH,
    LINUX_ENV_ETC_ENVIRONMENT,
    LINUX_ENV_EXPORT_EXAMPLE,
    LINUX_ENV_JAVA_HOME,
    LINUX_ENV_PERSIST_USER_PROFILE,
    LINUX_ENV_PROFILE_D,
    LINUX_ENV_RELOAD,
    LINUX_ENV_SYSTEMD_SERVICE,
    LINUX_ENV_SYSTEMD_USER,
    LINUX_ENV_VERIFY,
} from '@/common/linux-utils';
import CodeSnippet from '@/elements/CodeSnippet';
import React from 'react';

const mutedNote: React.CSSProperties = { fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginTop: 8 };

const EnvironmentVariablesSection: React.FC = () => (
    <section>
        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">1</span> Set a variable for this terminal session
            </div>
            <p>
                <code>export</code> sets a variable in the current shell process. It is inherited by any command you run
                afterwards from this same terminal, but it disappears the moment the terminal closes.
            </p>
            <CodeSnippet headerText="bash" content={LINUX_ENV_EXPORT_EXAMPLE} language="bash" />
            <p style={mutedNote}>
                <strong>Reaches:</strong> this terminal session only. Not new terminals, not GUI apps.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">2</span> Persist it for your user — shell profile
            </div>
            <p>
                Appending the <code>export</code> to <code>~/.bashrc</code> or <code>~/.zshrc</code> makes every new
                interactive shell pick it up automatically.
            </p>
            <CodeSnippet headerText="bash" content={LINUX_ENV_PERSIST_USER_PROFILE} language="bash" />
            <p style={mutedNote}>
                <strong>Reaches:</strong> all future terminal sessions for your user. Still not GUI apps launched from
                the desktop launcher — those don&apos;t start from a login shell.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">3</span> Add a directory to PATH
            </div>
            <p>Prepend a directory so its binaries are found before system defaults.</p>
            <CodeSnippet headerText="bash" content={LINUX_ENV_ADD_TO_PATH} language="bash" />
            <p style={mutedNote}>
                <strong>Reaches:</strong> same as above — your terminal sessions once added to a profile file.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">4</span> Set JAVA_HOME
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
                <span className="n">5</span> Reload the shell profile
            </div>
            <p>Apply changes made to your shell profile without opening a new terminal.</p>
            <CodeSnippet headerText="bash" content={LINUX_ENV_RELOAD} language="bash" />
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">6</span> System-wide for all users — /etc/environment
            </div>
            <p>
                Read very early in the login process by the PAM module <code>pam_env.so</code>. It is{' '}
                <strong>not</strong> a shell script — no <code>export</code>, no variable expansion, no conditionals.
                Strict <code>KEY=VALUE</code> only.
            </p>
            <CodeSnippet headerText="bash" content={LINUX_ENV_ETC_ENVIRONMENT} language="bash" />
            <p style={mutedNote}>
                <strong>Reaches:</strong> all users, on their next PAM-authenticated login. Does <strong>not</strong>{' '}
                affect systemd services, and reaching a GUI session depends on the display manager loading{' '}
                <code>pam_env</code>. Takes effect at next login, not the current session.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">7</span> System-wide login shells — /etc/profile.d
            </div>
            <p>
                Scripts here are sourced by <code>/etc/profile</code> for all Bourne-compatible login shells, so —
                unlike <code>/etc/environment</code> — they support <code>export</code>, <code>$PATH</code> expansion,
                and conditionals.
            </p>
            <CodeSnippet headerText="bash" content={LINUX_ENV_PROFILE_D} language="bash" />
            <p style={mutedNote}>
                <strong>Reaches:</strong> all users&apos; login shells. Typically not GUI apps launched from the
                GNOME/KDE application launcher.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">8</span> Reach the GUI session — systemd environment.d
            </div>
            <p>
                On Wayland (GDM, KDE Plasma) the graphical session is launched by systemd, not a login shell, so{' '}
                <code>.profile</code>/<code>.xsession</code> no longer apply. These <code>KEY=VALUE</code> files are
                picked up by systemd&apos;s user environment generator (systemd ≥ 233).
            </p>
            <CodeSnippet headerText="bash" content={LINUX_ENV_SYSTEMD_USER} language="bash" />
            <p style={mutedNote}>
                <strong>Reaches:</strong> GUI apps launched in your GNOME/KDE session, per-user. KDE Plasma also
                supports per-user scripts dropped in <code>~/.config/plasma-workspace/env/</code> as an alternative.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">9</span> systemd services — set explicitly
            </div>
            <p>
                Every systemd service runs in a clean, minimal environment — it does <strong>not</strong> inherit your
                shell profile, <code>/etc/environment</code>, or <code>/etc/profile.d</code>. Set variables directly on
                the service.
            </p>
            <CodeSnippet
                headerText="systemctl edit myapp.service"
                content={LINUX_ENV_SYSTEMD_SERVICE}
                language="bash"
            />
            <p style={mutedNote}>
                <strong>Reaches:</strong> only the one service you edited. For all services system-wide, use{' '}
                <code>DefaultEnvironment=</code> in <code>/etc/systemd/system.conf</code> and{' '}
                <code>sudo systemctl daemon-reload</code>.
            </p>
        </div>

        <div className="card pad" style={{ marginBottom: 16 }}>
            <div className="steplabel">
                <span className="n">10</span> Verify
            </div>
            <p>
                No method here updates already-running processes — every process only gets a copy of its parent&apos;s
                environment at launch. Log out/in (or restart the service) and check from a fresh session.
            </p>
            <CodeSnippet headerText="bash" content={LINUX_ENV_VERIFY} language="bash" />
        </div>
    </section>
);

export default EnvironmentVariablesSection;
